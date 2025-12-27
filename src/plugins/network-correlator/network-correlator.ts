import type {
  Kernel,
  Plugin,
  RenderEvent,
  NetworkRequest,
  Correlation,
  RequestStats,
} from '../../types'
import { uid } from '../../utils/uid'

export interface NetworkCorrelatorAPI {
  [key: string]: unknown
  getRequestsForComponent(componentId: string): NetworkRequest[]
  getRendersForRequest(requestId: string): RenderEvent[]
  getCorrelations(): Correlation[]
  startCapturing(): void
  stopCapturing(): void
  isCapturing(): boolean
  getRequestStats(): RequestStats
  clearRequests(): void
  getAllRequests(): NetworkRequest[]
}

/**
 * Network Correlator Plugin
 * Correlates renders with network requests.
 */
export class NetworkCorrelatorPlugin implements Plugin {
  readonly name = 'network-correlator'
  readonly version = '1.0.0'

  private capturing = false
  private requests: NetworkRequest[] = []
  private renderEvents: RenderEvent[] = []
  private correlations: Correlation[] = []
  private observer: PerformanceObserver | null = null
  private maxHistorySize = 1000
  private correlationWindow = 100 // ms - time window to correlate request completion with renders

  readonly api: NetworkCorrelatorAPI = {
    getRequestsForComponent: (componentId: string) => {
      return this.getRequestsForComponent(componentId)
    },

    getRendersForRequest: (requestId: string) => {
      const correlation = this.correlations.find((c) => c.request.id === requestId)
      return correlation?.renders ?? []
    },

    getCorrelations: () => {
      return [...this.correlations]
    },

    startCapturing: () => {
      this.startCapturing()
    },

    stopCapturing: () => {
      this.stopCapturing()
    },

    isCapturing: () => {
      return this.capturing
    },

    getRequestStats: () => {
      return this.getStats()
    },

    clearRequests: () => {
      this.requests = []
      this.correlations = []
    },

    getAllRequests: () => {
      return [...this.requests]
    },
  }

  readonly hooks = {
    onRender: (event: RenderEvent) => {
      if (this.capturing) {
        this.recordRenderEvent(event)
      }
    },
  }

  install(kernel: Kernel): void {
    this.maxHistorySize = kernel.getOptions().maxHistorySize ?? 1000
  }

  uninstall(): void {
    this.stopCapturing()
    this.requests = []
    this.renderEvents = []
    this.correlations = []
  }

  private startCapturing(): void {
    if (this.capturing) return

    this.capturing = true

    // Use PerformanceObserver to capture network requests
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.recordRequest(entry as PerformanceResourceTiming)
            }
          }
        })

        this.observer.observe({ entryTypes: ['resource'] })
      } catch (error) {
        console.warn('[ReactScope] PerformanceObserver not supported:', error)
      }
    }
  }

  private stopCapturing(): void {
    if (!this.capturing) return

    this.capturing = false

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  private recordRequest(entry: PerformanceResourceTiming): void {
    // Filter out data URLs, extensions, etc.
    if (entry.name.startsWith('data:') || entry.name.startsWith('chrome-extension:')) {
      return
    }

    const request: NetworkRequest = {
      id: uid(),
      url: entry.name,
      method: 'GET', // PerformanceResourceTiming doesn't expose method
      startTime: entry.startTime,
      endTime: entry.responseEnd,
      status: 200, // PerformanceResourceTiming doesn't expose status
      size: entry.transferSize || 0,
    }

    this.requests.push(request)

    // Limit history
    if (this.requests.length > this.maxHistorySize) {
      this.requests = this.requests.slice(-this.maxHistorySize)
    }

    // Find correlated renders (renders that happened shortly after request completed)
    this.findCorrelations(request)
  }

  private recordRenderEvent(event: RenderEvent): void {
    this.renderEvents.push(event)

    // Limit history
    if (this.renderEvents.length > this.maxHistorySize) {
      this.renderEvents = this.renderEvents.slice(-this.maxHistorySize)
    }
  }

  private findCorrelations(request: NetworkRequest): void {
    // Find renders that happened within the correlation window after request completed
    const requestEndTime = request.startTime + (request.endTime - request.startTime)
    const windowStart = requestEndTime
    const windowEnd = requestEndTime + this.correlationWindow

    const correlatedRenders = this.renderEvents.filter((render) => {
      const renderTime = render.timestamp - performance.timeOrigin
      return renderTime >= windowStart && renderTime <= windowEnd
    })

    if (correlatedRenders.length > 0) {
      this.correlations.push({
        request,
        renders: correlatedRenders,
        timeGap: correlatedRenders[0]
          ? (correlatedRenders[0].timestamp - performance.timeOrigin) - requestEndTime
          : 0,
      })

      // Limit correlations
      if (this.correlations.length > this.maxHistorySize) {
        this.correlations = this.correlations.slice(-this.maxHistorySize)
      }
    }
  }

  private getRequestsForComponent(componentId: string): NetworkRequest[] {
    const componentRequests: NetworkRequest[] = []

    for (const correlation of this.correlations) {
      if (correlation.renders.some((r) => r.componentId === componentId)) {
        componentRequests.push(correlation.request)
      }
    }

    return componentRequests
  }

  private getStats(): RequestStats {
    if (this.requests.length === 0) {
      return {
        totalRequests: 0,
        averageTime: 0,
        slowestRequest: null,
      }
    }

    const times = this.requests.map((r) => r.endTime - r.startTime)
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length

    const slowestIndex = times.indexOf(Math.max(...times))
    const slowestRequest = this.requests[slowestIndex] ?? null

    return {
      totalRequests: this.requests.length,
      averageTime,
      slowestRequest,
    }
  }
}

/**
 * Create a new network correlator plugin instance.
 */
export function createNetworkCorrelatorPlugin(): NetworkCorrelatorPlugin {
  return new NetworkCorrelatorPlugin()
}
