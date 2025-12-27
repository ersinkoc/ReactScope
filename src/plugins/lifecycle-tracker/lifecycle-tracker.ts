import type {
  Kernel,
  Plugin,
  MountEvent,
  UnmountEvent,
  LifecycleEvent,
} from '../../types'

export interface LifecycleTrackerAPI {
  [key: string]: unknown
  getMountTime(componentId: string): number | null
  getUnmountTime(componentId: string): number | null
  getLifetime(componentId: string): number | null
  getMountCount(componentId: string): number
  isCurrentlyMounted(componentId: string): boolean
  getLifecycleHistory(componentId: string): LifecycleEvent[]
  getMountedComponents(): string[]
  getAverageLifetime(componentId: string): number
  getAllMountCounts(): Map<string, number>
}

interface LifecycleHistory {
  events: LifecycleEvent[]
  lifetimes: number[]
}

/**
 * Lifecycle Tracker Plugin
 * Tracks mount/unmount events and component lifecycle.
 */
export class LifecycleTrackerPlugin implements Plugin {
  readonly name = 'lifecycle-tracker'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private lifecycleHistory = new Map<string, LifecycleHistory>()
  private maxHistorySize = 100

  readonly api: LifecycleTrackerAPI = {
    getMountTime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.mountTime ?? null
    },

    getUnmountTime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.unmountTime ?? null
    },

    getLifetime: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      if (!metrics?.mountTime) {
        return null
      }

      if (metrics.unmountTime) {
        return metrics.unmountTime - metrics.mountTime
      }

      // Still mounted
      if (metrics.isCurrentlyMounted) {
        return Date.now() - metrics.mountTime
      }

      return null
    },

    getMountCount: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.mountCount ?? 0
    },

    isCurrentlyMounted: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      return metrics?.isCurrentlyMounted ?? false
    },

    getLifecycleHistory: (componentId: string) => {
      return this.lifecycleHistory.get(componentId)?.events ?? []
    },

    getMountedComponents: () => {
      const mounted: string[] = []
      const allMetrics = this.kernel?.getMetrics().getAll()

      if (allMetrics) {
        for (const [id, metrics] of allMetrics) {
          if (metrics.isCurrentlyMounted) {
            mounted.push(id)
          }
        }
      }

      return mounted
    },

    getAverageLifetime: (componentId: string) => {
      const history = this.lifecycleHistory.get(componentId)
      if (!history || history.lifetimes.length === 0) {
        return 0
      }

      const sum = history.lifetimes.reduce((a, b) => a + b, 0)
      return sum / history.lifetimes.length
    },

    getAllMountCounts: () => {
      const counts = new Map<string, number>()
      const allMetrics = this.kernel?.getMetrics().getAll()

      if (allMetrics) {
        for (const [id, metrics] of allMetrics) {
          counts.set(id, metrics.mountCount)
        }
      }

      return counts
    },
  }

  readonly hooks = {
    onMount: (event: MountEvent) => {
      this.trackMount(event)
    },

    onUnmount: (event: UnmountEvent) => {
      this.trackUnmount(event)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
    this.maxHistorySize = kernel.getOptions().maxHistorySize ?? 100
  }

  uninstall(): void {
    this.kernel = null
    this.lifecycleHistory.clear()
  }

  private trackMount(event: MountEvent): void {
    if (!this.kernel) return

    const metrics = this.kernel.getMetrics().get(event.componentId)

    // Update metrics
    this.kernel.updateMetrics(event.componentId, {
      componentName: event.componentName,
      mountTime: event.timestamp,
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: (metrics?.mountCount ?? 0) + 1,
      parentId: event.parentId,
    })

    // Update tree
    this.kernel.getMetrics().updateTree(event.componentId, event.componentName, event.parentId)

    // Record lifecycle event
    this.recordLifecycleEvent(event.componentId, {
      type: 'mount',
      timestamp: event.timestamp,
      componentId: event.componentId,
      componentName: event.componentName,
    })
  }

  private trackUnmount(event: UnmountEvent): void {
    if (!this.kernel) return

    const metrics = this.kernel.getMetrics().get(event.componentId)

    // Calculate lifetime if mount time is known
    if (metrics?.mountTime) {
      const lifetime = event.timestamp - metrics.mountTime
      this.recordLifetime(event.componentId, lifetime)
    }

    // Update metrics
    this.kernel.updateMetrics(event.componentId, {
      unmountTime: event.timestamp,
      isCurrentlyMounted: false,
    })

    // Remove from tree
    this.kernel.getMetrics().removeFromTree(event.componentId)

    // Record lifecycle event
    this.recordLifecycleEvent(event.componentId, {
      type: 'unmount',
      timestamp: event.timestamp,
      componentId: event.componentId,
      componentName: event.componentName,
    })
  }

  private recordLifecycleEvent(componentId: string, event: LifecycleEvent): void {
    let history = this.lifecycleHistory.get(componentId)
    if (!history) {
      history = { events: [], lifetimes: [] }
      this.lifecycleHistory.set(componentId, history)
    }

    history.events.push(event)

    // Limit history size
    if (history.events.length > this.maxHistorySize) {
      history.events = history.events.slice(-this.maxHistorySize)
    }
  }

  private recordLifetime(componentId: string, lifetime: number): void {
    let history = this.lifecycleHistory.get(componentId)
    if (!history) {
      history = { events: [], lifetimes: [] }
      this.lifecycleHistory.set(componentId, history)
    }

    history.lifetimes.push(lifetime)

    // Limit history size
    if (history.lifetimes.length > this.maxHistorySize) {
      history.lifetimes = history.lifetimes.slice(-this.maxHistorySize)
    }
  }
}

/**
 * Create a new lifecycle tracker plugin instance.
 */
export function createLifecycleTrackerPlugin(): LifecycleTrackerPlugin {
  return new LifecycleTrackerPlugin()
}
