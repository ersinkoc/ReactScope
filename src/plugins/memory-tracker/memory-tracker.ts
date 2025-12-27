import type {
  Kernel,
  Plugin,
  MemorySnapshot,
  MemoryStats,
  PotentialLeak,
} from '../../types'

export interface MemoryTrackerAPI {
  [key: string]: unknown
  getCurrentMemory(): MemorySnapshot | null
  getMemoryHistory(): MemorySnapshot[]
  getMemoryTrend(): 'increasing' | 'stable' | 'decreasing'
  detectPotentialLeaks(): PotentialLeak[]
  startMonitoring(intervalMs?: number): void
  stopMonitoring(): void
  isMonitoring(): boolean
  getMemoryStats(): MemoryStats
  clearHistory(): void
}

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

declare global {
  interface Performance {
    memory?: PerformanceMemory
  }
}

/**
 * Memory Tracker Plugin
 * Monitors memory usage patterns.
 */
export class MemoryTrackerPlugin implements Plugin {
  readonly name = 'memory-tracker'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private monitoring = false
  private intervalId: ReturnType<typeof setInterval> | null = null
  private history: MemorySnapshot[] = []
  private maxHistorySize = 1000
  private defaultInterval = 1000

  readonly api: MemoryTrackerAPI = {
    getCurrentMemory: () => {
      return this.getMemorySnapshot()
    },

    getMemoryHistory: () => {
      return [...this.history]
    },

    getMemoryTrend: () => {
      return this.calculateTrend()
    },

    detectPotentialLeaks: () => {
      return this.detectLeaks()
    },

    startMonitoring: (intervalMs?: number) => {
      this.startMonitoring(intervalMs)
    },

    stopMonitoring: () => {
      this.stopMonitoring()
    },

    isMonitoring: () => {
      return this.monitoring
    },

    getMemoryStats: () => {
      return this.getStats()
    },

    clearHistory: () => {
      this.history = []
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
    this.maxHistorySize = kernel.getOptions().maxHistorySize ?? 1000
  }

  uninstall(): void {
    this.stopMonitoring()
    this.kernel = null
    this.history = []
  }

  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 'memory' in performance && performance.memory !== undefined
  }

  private getMemorySnapshot(): MemorySnapshot | null {
    if (!this.isMemoryAPIAvailable()) {
      return null
    }

    const memory = performance.memory!
    return {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }

  private startMonitoring(intervalMs = this.defaultInterval): void {
    if (this.monitoring) return
    if (!this.isMemoryAPIAvailable()) {
      console.warn('[ReactScope] Memory API not available (Chrome only)')
      return
    }

    this.monitoring = true

    // Take initial snapshot
    this.recordSnapshot()

    // Start periodic monitoring
    this.intervalId = setInterval(() => {
      this.recordSnapshot()
    }, intervalMs)
  }

  private stopMonitoring(): void {
    if (!this.monitoring) return

    this.monitoring = false

    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private recordSnapshot(): void {
    const snapshot = this.getMemorySnapshot()
    if (!snapshot) return

    this.history.push(snapshot)

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }
  }

  private calculateTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.history.length < 10) {
      return 'stable'
    }

    // Compare average of first half vs second half
    const midpoint = Math.floor(this.history.length / 2)
    const firstHalf = this.history.slice(0, midpoint)
    const secondHalf = this.history.slice(midpoint)

    const avgFirst = this.average(firstHalf.map((s) => s.usedJSHeapSize))
    const avgSecond = this.average(secondHalf.map((s) => s.usedJSHeapSize))

    const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100

    if (percentChange > 10) {
      return 'increasing'
    } else if (percentChange < -10) {
      return 'decreasing'
    }

    return 'stable'
  }

  private detectLeaks(): PotentialLeak[] {
    const leaks: PotentialLeak[] = []

    if (!this.kernel) return leaks

    const allMetrics = this.kernel.getMetrics().getAll()

    for (const [componentId, metrics] of allMetrics) {
      // Check for components that unmount but memory keeps growing
      if (!metrics.isCurrentlyMounted && metrics.mountCount > 3) {
        leaks.push({
          componentId,
          componentName: metrics.componentName,
          reason: 'Frequent remounts',
          evidence: `Component has been mounted ${metrics.mountCount} times`,
        })
      }

      // Check for components with very high render counts
      if (metrics.renderCount > 100 && metrics.wastedRenderCount / metrics.renderCount > 0.5) {
        leaks.push({
          componentId,
          componentName: metrics.componentName,
          reason: 'Excessive wasted renders',
          evidence: `${metrics.wastedRenderCount} of ${metrics.renderCount} renders were wasted`,
        })
      }
    }

    // Check overall memory trend
    if (this.calculateTrend() === 'increasing' && this.history.length > 50) {
      const first = this.history[0]
      const last = this.history[this.history.length - 1]

      if (first && last) {
        const increase = last.usedJSHeapSize - first.usedJSHeapSize
        const percentIncrease = (increase / first.usedJSHeapSize) * 100

        if (percentIncrease > 50) {
          leaks.push({
            componentId: '__global__',
            componentName: 'Global Memory',
            reason: 'Memory continuously increasing',
            evidence: `Memory has increased by ${percentIncrease.toFixed(1)}% during session`,
          })
        }
      }
    }

    return leaks
  }

  private getStats(): MemoryStats {
    const current = this.getMemorySnapshot()

    if (this.history.length === 0) {
      return {
        current,
        min: 0,
        max: 0,
        average: 0,
        trend: 'stable',
      }
    }

    const usedSizes = this.history.map((s) => s.usedJSHeapSize)

    return {
      current,
      min: Math.min(...usedSizes),
      max: Math.max(...usedSizes),
      average: this.average(usedSizes),
      trend: this.calculateTrend(),
    }
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }
}

/**
 * Create a new memory tracker plugin instance.
 */
export function createMemoryTrackerPlugin(): MemoryTrackerPlugin {
  return new MemoryTrackerPlugin()
}
