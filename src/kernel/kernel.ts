import type {
  ComponentMetrics,
  Kernel as IKernel,
  KernelEvent,
  KernelOptions,
  MetricsStore,
  Plugin,
} from '../types'
import { createEventBus, EventBusImpl } from './event-bus'
import { createMetricsStore, createDefaultMetrics, MetricsStoreImpl } from './metrics-store'
import { createPluginRegistry, PluginRegistryImpl } from './plugin-registry'
import { uid } from '../utils/uid'

const DEFAULT_OPTIONS: Required<KernelOptions> = {
  enabled: true,
  trackAllComponents: false,
  sampleRate: 1,
  maxHistorySize: 1000,
}

/**
 * Kernel implementation.
 * Core of ReactScope that orchestrates plugins, events, and metrics.
 */
export class KernelImpl implements IKernel {
  private eventBus: EventBusImpl
  private metricsStore: MetricsStoreImpl
  private pluginRegistry: PluginRegistryImpl
  private options: Required<KernelOptions>
  private destroyed = false

  constructor(options: KernelOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.eventBus = createEventBus() as EventBusImpl
    this.metricsStore = createMetricsStore(this.options.maxHistorySize) as MetricsStoreImpl
    this.pluginRegistry = createPluginRegistry() as PluginRegistryImpl

    // Subscribe to events and forward to plugins
    this.setupEventForwarding()
  }

  private setupEventForwarding(): void {
    const eventTypes = [
      'render',
      'mount',
      'unmount',
      'props-change',
      'state-change',
      'metrics-update',
      'error',
    ] as const

    for (const eventType of eventTypes) {
      this.eventBus.on(eventType, (event) => {
        if (!this.options.enabled || this.destroyed) {
          return
        }

        // Apply sampling for render events
        if (eventType === 'render' && this.options.sampleRate < 1) {
          if (Math.random() > this.options.sampleRate) {
            return
          }
        }

        // Forward to all plugins with matching hooks
        for (const plugin of this.pluginRegistry.getAll()) {
          if (!plugin.hooks) continue

          try {
            switch (eventType) {
              case 'render':
                plugin.hooks.onRender?.(event as Extract<KernelEvent, { type: 'render' }>)
                break
              case 'mount':
                plugin.hooks.onMount?.(event as Extract<KernelEvent, { type: 'mount' }>)
                break
              case 'unmount':
                plugin.hooks.onUnmount?.(event as Extract<KernelEvent, { type: 'unmount' }>)
                break
              case 'props-change':
                plugin.hooks.onPropsChange?.(event as Extract<KernelEvent, { type: 'props-change' }>)
                break
              case 'state-change':
                plugin.hooks.onStateChange?.(event as Extract<KernelEvent, { type: 'state-change' }>)
                break
              case 'metrics-update':
                plugin.hooks.onMetricsUpdate?.(event as Extract<KernelEvent, { type: 'metrics-update' }>)
                break
              case 'error':
                plugin.hooks.onError?.(event as Extract<KernelEvent, { type: 'error' }>)
                break
            }
          } catch (error) {
            console.error(`[ReactScope] Error in plugin "${plugin.name}" hook for "${eventType}":`, error)
          }
        }

        // Add to timeline
        this.metricsStore.addTimelineEvent({
          id: uid(),
          type: eventType,
          timestamp: event.timestamp,
          data: event as unknown as Record<string, unknown>,
        })
      })
    }
  }

  /**
   * Register a plugin.
   */
  register(plugin: Plugin): void {
    if (this.destroyed) {
      throw new Error('[ReactScope] Cannot register plugin: kernel is destroyed')
    }

    this.pluginRegistry.register(plugin)

    try {
      plugin.install(this)
    } catch (error) {
      this.pluginRegistry.unregister(plugin.name)
      throw error
    }
  }

  /**
   * Unregister a plugin.
   */
  unregister(pluginName: string): void {
    const plugin = this.pluginRegistry.get(pluginName)
    if (!plugin) {
      return
    }

    try {
      plugin.uninstall()
    } catch (error) {
      console.error(`[ReactScope] Error uninstalling plugin "${pluginName}":`, error)
    }

    this.pluginRegistry.unregister(pluginName)
  }

  /**
   * Get a plugin by name.
   */
  getPlugin<T extends Plugin>(name: string): T | undefined {
    return this.pluginRegistry.get<T>(name)
  }

  /**
   * Get all registered plugins.
   */
  getPlugins(): Plugin[] {
    return this.pluginRegistry.getAll()
  }

  /**
   * Emit an event.
   */
  emit(event: KernelEvent): void {
    if (!this.options.enabled || this.destroyed) {
      return
    }

    this.eventBus.emit(event)
  }

  /**
   * Subscribe to an event type.
   */
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void {
    return this.eventBus.on(eventType, handler)
  }

  /**
   * Get the metrics store.
   */
  getMetrics(): MetricsStore {
    return this.metricsStore
  }

  /**
   * Update metrics for a component.
   */
  updateMetrics(componentId: string, partial: Partial<ComponentMetrics>): void {
    if (!this.options.enabled || this.destroyed) {
      return
    }

    let metrics = this.metricsStore.get(componentId)

    if (!metrics) {
      // Create new metrics
      const name = partial.componentName ?? 'Unknown'
      metrics = createDefaultMetrics(componentId, name)
      this.metricsStore.set(componentId, metrics)
    }

    this.metricsStore.update(componentId, partial)

    // Emit metrics update event
    const updatedMetrics = this.metricsStore.get(componentId)
    if (updatedMetrics) {
      this.emit({
        type: 'metrics-update',
        timestamp: Date.now(),
        componentId,
        metrics: updatedMetrics,
      })
    }
  }

  /**
   * Get metrics for a specific component.
   */
  getComponentMetrics(componentId: string): ComponentMetrics | undefined {
    return this.metricsStore.get(componentId)
  }

  /**
   * Clear all metrics.
   */
  clearMetrics(): void {
    this.metricsStore.clear()
  }

  /**
   * Configure the kernel.
   */
  configure(options: KernelOptions): void {
    this.options = { ...this.options, ...options }

    if (options.maxHistorySize !== undefined) {
      this.metricsStore.setMaxHistorySize(options.maxHistorySize)
    }
  }

  /**
   * Get current options.
   */
  getOptions(): KernelOptions {
    return { ...this.options }
  }

  /**
   * Check if the kernel is enabled.
   */
  isEnabled(): boolean {
    return this.options.enabled && !this.destroyed
  }

  /**
   * Enable the kernel.
   */
  enable(): void {
    this.options.enabled = true
  }

  /**
   * Disable the kernel.
   */
  disable(): void {
    this.options.enabled = false
  }

  /**
   * Destroy the kernel and clean up resources.
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // Uninstall all plugins
    for (const plugin of this.pluginRegistry.getAll()) {
      try {
        plugin.uninstall()
      } catch (error) {
        console.error(`[ReactScope] Error uninstalling plugin "${plugin.name}":`, error)
      }
    }

    this.pluginRegistry.clear()
    this.eventBus.clear()
    this.metricsStore.clear()
    this.destroyed = true
  }

  /**
   * Check if the kernel is destroyed.
   */
  isDestroyed(): boolean {
    return this.destroyed
  }
}

/**
 * Create a new kernel instance.
 */
export function createKernel(options?: KernelOptions): IKernel {
  return new KernelImpl(options)
}

/**
 * Singleton kernel instance for global access.
 */
let globalKernel: IKernel | null = null

/**
 * Get or create the global kernel instance.
 */
export function getKernel(): IKernel {
  if (!globalKernel) {
    globalKernel = createKernel()
  }
  return globalKernel
}

/**
 * Set the global kernel instance.
 */
export function setGlobalKernel(kernel: IKernel | null): void {
  globalKernel = kernel
}

/**
 * Reset the global kernel (for testing).
 */
export function resetGlobalKernel(): void {
  if (globalKernel) {
    globalKernel.destroy()
    globalKernel = null
  }
}
