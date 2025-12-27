import type {
  ComponentMetrics,
  ComponentTree,
  MetricsStore as IMetricsStore,
  MetricsStoreData,
  TimelineEvent,
} from '../types'
import { createTree, createNode, addChild, removeNode, findNode } from '../utils/tree'

/**
 * Default component metrics.
 */
export function createDefaultMetrics(componentId: string, componentName: string): ComponentMetrics {
  return {
    componentId,
    componentName,
    renderCount: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    wastedRenderCount: 0,
    mountTime: null,
    unmountTime: null,
    isCurrentlyMounted: false,
    mountCount: 0,
    propsChangeCount: 0,
    renderHistory: [],
    parentId: null,
    childIds: [],
  }
}

/**
 * Metrics store implementation.
 * Centralized storage for all component metrics.
 */
export class MetricsStoreImpl implements IMetricsStore {
  private components = new Map<string, ComponentMetrics>()
  private tree: ComponentTree = createTree()
  private timeline: TimelineEvent[] = []
  private sessionStart: number = Date.now()
  private lastUpdate: number = Date.now()
  private maxHistorySize: number

  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize
  }

  /**
   * Get metrics for a component.
   */
  get(componentId: string): ComponentMetrics | undefined {
    return this.components.get(componentId)
  }

  /**
   * Set metrics for a component.
   */
  set(componentId: string, metrics: ComponentMetrics): void {
    this.components.set(componentId, metrics)
    this.lastUpdate = Date.now()

    // Update tree node if exists
    const node = findNode(this.tree, componentId)
    if (node) {
      node.metrics = metrics
    }
  }

  /**
   * Update metrics for a component (partial update).
   */
  update(componentId: string, partial: Partial<ComponentMetrics>): void {
    const existing = this.components.get(componentId)
    if (existing) {
      const updated = { ...existing, ...partial }

      // Recalculate average render time
      if (partial.renderCount !== undefined || partial.totalRenderTime !== undefined) {
        updated.averageRenderTime =
          updated.renderCount > 0 ? updated.totalRenderTime / updated.renderCount : 0
      }

      this.components.set(componentId, updated)
      this.lastUpdate = Date.now()

      // Update tree node if exists
      const node = findNode(this.tree, componentId)
      if (node) {
        node.metrics = updated
      }
    }
  }

  /**
   * Delete metrics for a component.
   */
  delete(componentId: string): void {
    this.components.delete(componentId)
    removeNode(this.tree, componentId)
    this.lastUpdate = Date.now()
  }

  /**
   * Get all component metrics.
   */
  getAll(): Map<string, ComponentMetrics> {
    return new Map(this.components)
  }

  /**
   * Clear all metrics.
   */
  clear(): void {
    this.components.clear()
    this.tree = createTree()
    this.timeline = []
    this.sessionStart = Date.now()
    this.lastUpdate = Date.now()
  }

  /**
   * Get the component tree.
   */
  getTree(): ComponentTree {
    return this.tree
  }

  /**
   * Update the component tree with a new component.
   */
  updateTree(componentId: string, componentName: string, parentId: string | null): void {
    let node = findNode(this.tree, componentId)
    const metrics = this.components.get(componentId) ?? null

    if (!node) {
      node = createNode(componentId, componentName, metrics)
      this.tree.nodeMap.set(componentId, node)
    } else {
      node.name = componentName
      node.metrics = metrics
    }

    if (parentId) {
      const parentNode = findNode(this.tree, parentId)
      if (parentNode) {
        addChild(parentNode, node)

        // Update metrics parentId
        const componentMetrics = this.components.get(componentId)
        if (componentMetrics) {
          componentMetrics.parentId = parentId

          // Update parent's childIds
          const parentMetrics = this.components.get(parentId)
          if (parentMetrics && !parentMetrics.childIds.includes(componentId)) {
            parentMetrics.childIds.push(componentId)
          }
        }
      }
    } else if (!this.tree.root) {
      // Set as root if no parent and no root exists
      this.tree.root = node
      node.depth = 0
    }

    this.lastUpdate = Date.now()
  }

  /**
   * Remove a component from the tree.
   */
  removeFromTree(componentId: string): void {
    // Update parent's childIds
    const metrics = this.components.get(componentId)
    if (metrics?.parentId) {
      const parentMetrics = this.components.get(metrics.parentId)
      if (parentMetrics) {
        parentMetrics.childIds = parentMetrics.childIds.filter((id) => id !== componentId)
      }
    }

    removeNode(this.tree, componentId)
    this.lastUpdate = Date.now()
  }

  /**
   * Add a timeline event.
   */
  addTimelineEvent(event: TimelineEvent): void {
    this.timeline.push(event)

    // Limit timeline size
    if (this.timeline.length > this.maxHistorySize) {
      this.timeline = this.timeline.slice(-this.maxHistorySize)
    }

    this.lastUpdate = Date.now()
  }

  /**
   * Get timeline events.
   */
  getTimeline(limit?: number): TimelineEvent[] {
    if (limit && limit > 0) {
      return this.timeline.slice(-limit)
    }
    return [...this.timeline]
  }

  /**
   * Clear the timeline.
   */
  clearTimeline(): void {
    this.timeline = []
    this.lastUpdate = Date.now()
  }

  /**
   * Get session start time.
   */
  getSessionStart(): number {
    return this.sessionStart
  }

  /**
   * Get last update time.
   */
  getLastUpdate(): number {
    return this.lastUpdate
  }

  /**
   * Get session duration in milliseconds.
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStart
  }

  /**
   * Get raw data (for serialization).
   */
  getData(): MetricsStoreData {
    return {
      components: new Map(this.components),
      tree: this.tree,
      timeline: [...this.timeline],
      sessionStart: this.sessionStart,
      lastUpdate: this.lastUpdate,
    }
  }

  /**
   * Set the maximum history size.
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size

    // Trim existing data if needed
    if (this.timeline.length > size) {
      this.timeline = this.timeline.slice(-size)
    }

    for (const metrics of this.components.values()) {
      if (metrics.renderHistory.length > size) {
        metrics.renderHistory = metrics.renderHistory.slice(-size)
      }
    }
  }

  /**
   * Get component count.
   */
  getComponentCount(): number {
    return this.components.size
  }

  /**
   * Get mounted component count.
   */
  getMountedComponentCount(): number {
    let count = 0
    for (const metrics of this.components.values()) {
      if (metrics.isCurrentlyMounted) {
        count++
      }
    }
    return count
  }

  /**
   * Get total render count across all components.
   */
  getTotalRenderCount(): number {
    let total = 0
    for (const metrics of this.components.values()) {
      total += metrics.renderCount
    }
    return total
  }

  /**
   * Get total wasted render count across all components.
   */
  getTotalWastedRenderCount(): number {
    let total = 0
    for (const metrics of this.components.values()) {
      total += metrics.wastedRenderCount
    }
    return total
  }

  /**
   * Get average render time across all components.
   */
  getAverageRenderTime(): number {
    let totalTime = 0
    let totalRenders = 0

    for (const metrics of this.components.values()) {
      totalTime += metrics.totalRenderTime
      totalRenders += metrics.renderCount
    }

    return totalRenders > 0 ? totalTime / totalRenders : 0
  }
}

/**
 * Create a new metrics store instance.
 */
export function createMetricsStore(maxHistorySize?: number): IMetricsStore {
  return new MetricsStoreImpl(maxHistorySize)
}
