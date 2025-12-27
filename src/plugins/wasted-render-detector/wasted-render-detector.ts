import type {
  Kernel,
  Plugin,
  RenderEvent,
  PropsChangeEvent,
  WastedRender,
  WastedRenderStats,
  WastedRenderReason,
} from '../../types'

export interface WastedRenderDetectorAPI {
  [key: string]: unknown
  getWastedRenders(componentId: string): WastedRender[]
  getWastedRenderCount(componentId: string): number
  getWastedRenderPercentage(componentId: string): number
  getAllWastedRenders(): Map<string, WastedRender[]>
  getMostWastefulComponents(limit?: number): WastedRenderStats[]
  clearWastedRenders(componentId?: string): void
  markAsWasted(componentId: string, reason: WastedRenderReason, details?: string): void
}

/**
 * Wasted Render Detector Plugin
 * Detects renders where props/state didn't actually change.
 */
export class WastedRenderDetectorPlugin implements Plugin {
  readonly name = 'wasted-render-detector'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private wastedRenders = new Map<string, WastedRender[]>()
  private lastPropsChange = new Map<string, number>()
  private maxHistorySize = 100

  readonly api: WastedRenderDetectorAPI = {
    getWastedRenders: (componentId: string) => {
      return this.wastedRenders.get(componentId) ?? []
    },

    getWastedRenderCount: (componentId: string) => {
      return this.wastedRenders.get(componentId)?.length ?? 0
    },

    getWastedRenderPercentage: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      if (!metrics || metrics.renderCount === 0) {
        return 0
      }
      const wastedCount = this.wastedRenders.get(componentId)?.length ?? 0
      return (wastedCount / metrics.renderCount) * 100
    },

    getAllWastedRenders: () => {
      return new Map(this.wastedRenders)
    },

    getMostWastefulComponents: (limit = 10) => {
      const stats: WastedRenderStats[] = []

      for (const [componentId, wasted] of this.wastedRenders) {
        const metrics = this.kernel?.getMetrics().get(componentId)
        if (!metrics) continue

        stats.push({
          componentId,
          componentName: metrics.componentName,
          wastedCount: wasted.length,
          wastedPercentage: metrics.renderCount > 0 ? (wasted.length / metrics.renderCount) * 100 : 0,
        })
      }

      return stats.sort((a, b) => b.wastedCount - a.wastedCount).slice(0, limit)
    },

    clearWastedRenders: (componentId?: string) => {
      if (componentId) {
        this.wastedRenders.delete(componentId)
      } else {
        this.wastedRenders.clear()
      }
    },

    markAsWasted: (componentId: string, reason: WastedRenderReason, details?: string) => {
      this.recordWastedRender(componentId, reason, details ?? '')
    },
  }

  readonly hooks = {
    onRender: (event: RenderEvent) => {
      this.checkForWastedRender(event)
    },

    onPropsChange: (event: PropsChangeEvent) => {
      this.lastPropsChange.set(event.componentId, event.timestamp)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
    this.maxHistorySize = kernel.getOptions().maxHistorySize ?? 100
  }

  uninstall(): void {
    this.kernel = null
    this.wastedRenders.clear()
    this.lastPropsChange.clear()
  }

  private checkForWastedRender(event: RenderEvent): void {
    if (!this.kernel) return

    // Skip mount phase - first render is never wasted
    if (event.phase === 'mount') {
      return
    }

    const lastChange = this.lastPropsChange.get(event.componentId)

    // If there's been no props change since the last render, this might be wasted
    // We use a small time window to account for timing differences
    const timeWindow = 5 // ms

    if (!lastChange || event.timestamp - lastChange > timeWindow) {
      // No recent props change - this render might be wasted
      // However, state changes or context changes could also cause renders
      // For now, we'll be conservative and only mark as wasted if explicitly told
      // or if we can verify props were unchanged

      // We'll mark this as potentially wasted based on no recent props changes
      // The actual determination should be done at the component level
    }
  }

  private recordWastedRender(
    componentId: string,
    reason: WastedRenderReason,
    details: string
  ): void {
    if (!this.kernel) return

    const metrics = this.kernel.getMetrics().get(componentId)

    const wastedRender: WastedRender = {
      timestamp: Date.now(),
      reason,
      details,
      componentId,
      componentName: metrics?.componentName ?? 'Unknown',
    }

    let wasted = this.wastedRenders.get(componentId)
    if (!wasted) {
      wasted = []
      this.wastedRenders.set(componentId, wasted)
    }

    wasted.push(wastedRender)

    // Limit history size
    if (wasted.length > this.maxHistorySize) {
      this.wastedRenders.set(componentId, wasted.slice(-this.maxHistorySize))
    }

    // Update metrics
    this.kernel.updateMetrics(componentId, {
      wastedRenderCount: (metrics?.wastedRenderCount ?? 0) + 1,
    })

    // Update render history to mark as wasted
    if (metrics && metrics.renderHistory.length > 0) {
      const lastRecord = metrics.renderHistory[metrics.renderHistory.length - 1]
      if (lastRecord) {
        lastRecord.wasWasted = true
      }
    }
  }

  /**
   * Check if the last render was wasted based on props comparison.
   */
  checkAndMarkWasted(
    componentId: string,
    prevProps: unknown,
    nextProps: unknown,
    prevState?: unknown,
    nextState?: unknown
  ): boolean {
    // Check props
    if (prevProps === nextProps || this.shallowEqual(prevProps, nextProps)) {
      // Check state if provided
      if (prevState === undefined && nextState === undefined) {
        this.recordWastedRender(componentId, 'props-unchanged', 'Props are shallow equal')
        return true
      }

      if (prevState === nextState || this.shallowEqual(prevState, nextState)) {
        this.recordWastedRender(
          componentId,
          'props-unchanged',
          'Both props and state are shallow equal'
        )
        return true
      }
    }

    return false
  }

  private shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) {
      return true
    }

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return false
    }

    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)

    if (keysA.length !== keysB.length) {
      return false
    }

    const objA = a as Record<string, unknown>
    const objB = b as Record<string, unknown>

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
        return false
      }
    }

    return true
  }
}

/**
 * Create a new wasted render detector plugin instance.
 */
export function createWastedRenderDetectorPlugin(): WastedRenderDetectorPlugin {
  return new WastedRenderDetectorPlugin()
}
