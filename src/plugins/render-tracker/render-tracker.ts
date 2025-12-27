import type { Kernel, Plugin, RenderEvent, RenderRecord } from '../../types'

export interface RenderTrackerAPI {
  [key: string]: unknown
  getRenderCount(componentId: string): number
  getAverageRenderTime(componentId: string): number
  getTotalRenderTime(componentId: string): number
  getLastRenderTime(componentId: string): number
  getRenderHistory(componentId: string): RenderRecord[]
  getSlowRenders(threshold?: number): RenderRecord[]
  getRendersByTimeRange(start: number, end: number): RenderRecord[]
  getAllRenderCounts(): Map<string, number>
}

/**
 * Render Tracker Plugin
 * Tracks render count and duration for each component.
 */
export class RenderTrackerPlugin implements Plugin {
  readonly name = 'render-tracker'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private unsubscribe: (() => void) | null = null

  readonly api: RenderTrackerAPI = {
    getRenderCount: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.renderCount ?? 0
    },

    getAverageRenderTime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.averageRenderTime ?? 0
    },

    getTotalRenderTime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.totalRenderTime ?? 0
    },

    getLastRenderTime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.lastRenderTime ?? 0
    },

    getRenderHistory: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.renderHistory ?? []
    },

    getSlowRenders: (threshold = 16) => {
      const slowRenders: RenderRecord[] = []
      const allMetrics = this.kernel?.getMetrics().getAll()

      if (allMetrics) {
        for (const metrics of allMetrics.values()) {
          for (const record of metrics.renderHistory) {
            if (record.duration > threshold) {
              slowRenders.push(record)
            }
          }
        }
      }

      return slowRenders.sort((a, b) => b.duration - a.duration)
    },

    getRendersByTimeRange: (start: number, end: number) => {
      const renders: RenderRecord[] = []
      const allMetrics = this.kernel?.getMetrics().getAll()

      if (allMetrics) {
        for (const metrics of allMetrics.values()) {
          for (const record of metrics.renderHistory) {
            if (record.timestamp >= start && record.timestamp <= end) {
              renders.push(record)
            }
          }
        }
      }

      return renders.sort((a, b) => a.timestamp - b.timestamp)
    },

    getAllRenderCounts: () => {
      const counts = new Map<string, number>()
      const allMetrics = this.kernel?.getMetrics().getAll()

      if (allMetrics) {
        for (const [id, metrics] of allMetrics) {
          counts.set(id, metrics.renderCount)
        }
      }

      return counts
    },
  }

  readonly hooks = {
    onRender: (event: RenderEvent) => {
      this.trackRender(event)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
  }

  uninstall(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.kernel = null
  }

  private trackRender(event: RenderEvent): void {
    if (!this.kernel) return

    const metrics = this.kernel.getMetrics().get(event.componentId)
    const currentHistory = metrics?.renderHistory ?? []

    const record: RenderRecord = {
      timestamp: event.timestamp,
      duration: event.duration,
      phase: event.phase,
      wasWasted: false,
      propsChanged: [],
    }

    // Limit history size
    const maxHistory = this.kernel.getOptions().maxHistorySize ?? 1000
    const newHistory = [...currentHistory, record].slice(-maxHistory)

    const renderCount = (metrics?.renderCount ?? 0) + 1
    const totalRenderTime = (metrics?.totalRenderTime ?? 0) + event.duration

    this.kernel.updateMetrics(event.componentId, {
      componentName: event.componentName,
      renderCount,
      totalRenderTime,
      averageRenderTime: totalRenderTime / renderCount,
      lastRenderTime: event.duration,
      renderHistory: newHistory,
    })
  }
}

/**
 * Create a new render tracker plugin instance.
 */
export function createRenderTrackerPlugin(): RenderTrackerPlugin {
  return new RenderTrackerPlugin()
}
