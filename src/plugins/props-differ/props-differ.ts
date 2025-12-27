import type { Kernel, Plugin, PropsChangeEvent, PropsDiff, PropsSnapshot, PropChangeStats } from '../../types'
import { deepEqual } from '../../utils/deep-equal'

export interface PropsDifferAPI {
  [key: string]: unknown
  getPropsHistory(componentId: string): PropsSnapshot[]
  getLastChange(componentId: string): PropsDiff[] | null
  getChangeFrequency(componentId: string, propKey: string): number
  getMostChangedProps(componentId: string, limit?: number): PropChangeStats[]
  compareProps(prev: unknown, next: unknown): PropsDiff[]
  clearHistory(componentId?: string): void
}

interface PropsHistoryEntry {
  snapshots: PropsSnapshot[]
  changes: PropsDiff[][]
  propChangeCounts: Map<string, number>
}

/**
 * Props Differ Plugin
 * Analyzes props changes between renders.
 */
export class PropsDifferPlugin implements Plugin {
  readonly name = 'props-differ'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private propsHistory = new Map<string, PropsHistoryEntry>()
  private maxHistorySize = 100

  readonly api: PropsDifferAPI = {
    getPropsHistory: (componentId: string) => {
      return this.propsHistory.get(componentId)?.snapshots ?? []
    },

    getLastChange: (componentId: string) => {
      const history = this.propsHistory.get(componentId)
      if (!history || history.changes.length === 0) {
        return null
      }
      return history.changes[history.changes.length - 1] ?? null
    },

    getChangeFrequency: (componentId: string, propKey: string) => {
      const history = this.propsHistory.get(componentId)
      return history?.propChangeCounts.get(propKey) ?? 0
    },

    getMostChangedProps: (componentId: string, limit = 10) => {
      const history = this.propsHistory.get(componentId)
      if (!history) {
        return []
      }

      const stats: PropChangeStats[] = []
      for (const [key, count] of history.propChangeCounts) {
        stats.push({
          key,
          changeCount: count,
          lastChange: this.getLastChangeTime(componentId, key),
        })
      }

      return stats.sort((a, b) => b.changeCount - a.changeCount).slice(0, limit)
    },

    compareProps: (prev: unknown, next: unknown) => {
      return this.computeDiff(prev, next)
    },

    clearHistory: (componentId?: string) => {
      if (componentId) {
        this.propsHistory.delete(componentId)
      } else {
        this.propsHistory.clear()
      }
    },
  }

  readonly hooks = {
    onPropsChange: (event: PropsChangeEvent) => {
      this.recordPropsChange(event)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
    this.maxHistorySize = kernel.getOptions().maxHistorySize ?? 100
  }

  uninstall(): void {
    this.kernel = null
    this.propsHistory.clear()
  }

  private recordPropsChange(event: PropsChangeEvent): void {
    if (!this.kernel) return

    let history = this.propsHistory.get(event.componentId)
    if (!history) {
      history = {
        snapshots: [],
        changes: [],
        propChangeCounts: new Map(),
      }
      this.propsHistory.set(event.componentId, history)
    }

    // Record changes
    history.changes.push(event.changes)
    if (history.changes.length > this.maxHistorySize) {
      history.changes = history.changes.slice(-this.maxHistorySize)
    }

    // Update prop change counts
    for (const change of event.changes) {
      const current = history.propChangeCounts.get(change.key) ?? 0
      history.propChangeCounts.set(change.key, current + 1)
    }

    // Update metrics
    this.kernel.updateMetrics(event.componentId, {
      propsChangeCount: (this.kernel.getMetrics().get(event.componentId)?.propsChangeCount ?? 0) + 1,
    })
  }

  private computeDiff(prev: unknown, next: unknown): PropsDiff[] {
    const diffs: PropsDiff[] = []

    if (typeof prev !== 'object' || typeof next !== 'object' || prev === null || next === null) {
      if (!deepEqual(prev, next)) {
        diffs.push({
          key: '$root',
          prev,
          next,
          isDeepEqual: false,
        })
      }
      return diffs
    }

    const prevObj = prev as Record<string, unknown>
    const nextObj = next as Record<string, unknown>

    const allKeys = new Set([...Object.keys(prevObj), ...Object.keys(nextObj)])

    for (const key of allKeys) {
      const prevValue = prevObj[key]
      const nextValue = nextObj[key]

      if (!Object.is(prevValue, nextValue)) {
        diffs.push({
          key,
          prev: prevValue,
          next: nextValue,
          isDeepEqual: deepEqual(prevValue, nextValue),
        })
      }
    }

    return diffs
  }

  private getLastChangeTime(componentId: string, propKey: string): number {
    const history = this.propsHistory.get(componentId)
    if (!history) return 0

    // Find the last change that includes this prop key
    for (let i = history.changes.length - 1; i >= 0; i--) {
      const changes = history.changes[i]
      if (changes?.some((c) => c.key === propKey)) {
        // Return the timestamp from snapshots if available
        const snapshot = history.snapshots[i]
        return snapshot?.timestamp ?? Date.now()
      }
    }

    return 0
  }

  /**
   * Record a props snapshot.
   */
  recordSnapshot(componentId: string, props: Record<string, unknown>): void {
    let history = this.propsHistory.get(componentId)
    if (!history) {
      history = {
        snapshots: [],
        changes: [],
        propChangeCounts: new Map(),
      }
      this.propsHistory.set(componentId, history)
    }

    history.snapshots.push({
      timestamp: Date.now(),
      props: { ...props },
    })

    if (history.snapshots.length > this.maxHistorySize) {
      history.snapshots = history.snapshots.slice(-this.maxHistorySize)
    }
  }
}

/**
 * Create a new props differ plugin instance.
 */
export function createPropsDifferPlugin(): PropsDifferPlugin {
  return new PropsDifferPlugin()
}
