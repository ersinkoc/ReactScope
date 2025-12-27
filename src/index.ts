// Types
export type {
  // Core types
  ComponentMetrics,
  RenderRecord,
  MetricsStoreData,
  ComponentTree,
  TreeNode,
  // Event types
  KernelEventType,
  KernelEvent,
  RenderEvent,
  MountEvent,
  UnmountEvent,
  PropsChangeEvent,
  StateChangeEvent,
  MetricsUpdateEvent,
  ErrorEvent,
  TimelineEvent,
  // Props diff types
  PropsDiff,
  PropsSnapshot,
  PropChangeStats,
  // Wasted render types
  WastedRenderReason,
  WastedRender,
  WastedRenderStats,
  // Lifecycle types
  LifecycleEventType,
  LifecycleEvent,
  // Memory types
  MemorySnapshot,
  MemoryStats,
  PotentialLeak,
  // Network types
  NetworkRequest,
  Correlation,
  RequestStats,
  // Timeline types
  TimestampedEvent,
  TimelineRecording,
  // Export types
  ExportSummary,
  ComponentSummary,
  SerializableMetrics,
  // Plugin types
  Plugin,
  PluginHooks,
  // Kernel types
  KernelOptions,
  Kernel,
  MetricsStore,
  EventBus,
  PluginRegistry,
  // React types
  ReactScopeProviderProps,
  ScopeProps,
  UseScopeOptions,
  ScopeHandle,
  WithScopeOptions,
  // Dashboard types
  DashboardPosition,
  DashboardTheme,
  DashboardOptions,
  DashboardState,
  // Console reporter types
  LogLevel,
  ConsoleReporterOptions,
  // Utility types
  Unsubscribe,
  ThrottleOptions,
  DebounceOptions,
  TimelineOptions,
  // Error types
  ScopeError,
} from './types'

// Kernel
import { getKernel as getGlobalKernel } from './kernel'
export {
  createKernel,
  getKernel,
  setGlobalKernel,
  resetGlobalKernel,
} from './kernel'

// Plugins
export {
  // Core plugins
  RenderTrackerPlugin,
  createRenderTrackerPlugin,
  PropsDifferPlugin,
  createPropsDifferPlugin,
  WastedRenderDetectorPlugin,
  createWastedRenderDetectorPlugin,
  LifecycleTrackerPlugin,
  createLifecycleTrackerPlugin,
  // Additional plugins
  ConsoleReporterPlugin,
  createConsoleReporterPlugin,
  JSONExporterPlugin,
  createJSONExporterPlugin,
  TimelineRecorderPlugin,
  createTimelineRecorderPlugin,
  MemoryTrackerPlugin,
  createMemoryTrackerPlugin,
  NetworkCorrelatorPlugin,
  createNetworkCorrelatorPlugin,
  // Dashboard UI
  DashboardUIPlugin,
  createDashboardUIPlugin,
} from './plugins'

// Plugin API types
export type {
  RenderTrackerAPI,
  PropsDifferAPI,
  WastedRenderDetectorAPI,
  LifecycleTrackerAPI,
  ConsoleReporterAPI,
  JSONExporterAPI,
  TimelineRecorderAPI,
  MemoryTrackerAPI,
  NetworkCorrelatorAPI,
  DashboardUIAPI,
} from './plugins'

// React integration
export {
  // Provider
  ReactScopeProvider,
  // Context
  ScopeContext,
  useScopeContext,
  useScopeContextSafe,
  // Hooks
  useScope,
  useScopeMetrics,
  useAllScopeMetrics,
  useScopeSummary,
  // Components
  Scope,
  // HOC
  withScope,
} from './react'

// Utilities (for plugin development)
export {
  deepEqual,
  shallowEqual,
  uid,
  createIdGenerator,
  throttle,
  debounce,
  formatDuration,
  formatBytes,
  formatNumber,
  formatPercentage,
  formatTimestamp,
  formatRelativeTime,
} from './utils'

// Helper function to create a plugin
export function createPlugin(config: {
  name: string
  version: string
  hooks?: import('./types').PluginHooks
  api?: Record<string, unknown>
  install?: (kernel: import('./types').Kernel) => void
  uninstall?: () => void
}): import('./types').Plugin {
  return {
    name: config.name,
    version: config.version,
    hooks: config.hooks,
    api: config.api,
    install: config.install ?? (() => {}),
    uninstall: config.uninstall ?? (() => {}),
  }
}

// Convenience function to get metrics from global kernel
export function getMetrics(): import('./types').MetricsStore | null {
  const kernel = getGlobalKernel()
  return kernel?.getMetrics() ?? null
}

// Convenience function to export metrics as JSON
export function exportMetrics(): string {
  const kernel = getGlobalKernel()
  const plugin = kernel?.getPlugin<import('./plugins').JSONExporterPlugin>('json-exporter')
  return plugin?.api?.exportAll?.() ?? '{}'
}

// Convenience function to clear all metrics
export function clearMetrics(): void {
  const kernel = getGlobalKernel()
  kernel?.clearMetrics()
}
