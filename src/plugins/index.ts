// Core plugins
export { RenderTrackerPlugin, createRenderTrackerPlugin, type RenderTrackerAPI } from './render-tracker'
export { PropsDifferPlugin, createPropsDifferPlugin, type PropsDifferAPI } from './props-differ'
export {
  WastedRenderDetectorPlugin,
  createWastedRenderDetectorPlugin,
  type WastedRenderDetectorAPI,
} from './wasted-render-detector'
export { LifecycleTrackerPlugin, createLifecycleTrackerPlugin, type LifecycleTrackerAPI } from './lifecycle-tracker'

// Additional plugins
export { ConsoleReporterPlugin, createConsoleReporterPlugin, type ConsoleReporterAPI } from './console-reporter'
export { JSONExporterPlugin, createJSONExporterPlugin, type JSONExporterAPI } from './json-exporter'
export { TimelineRecorderPlugin, createTimelineRecorderPlugin, type TimelineRecorderAPI } from './timeline-recorder'
export { MemoryTrackerPlugin, createMemoryTrackerPlugin, type MemoryTrackerAPI } from './memory-tracker'
export { NetworkCorrelatorPlugin, createNetworkCorrelatorPlugin, type NetworkCorrelatorAPI } from './network-correlator'

// Dashboard UI
export { DashboardUIPlugin, createDashboardUIPlugin, type DashboardUIAPI } from './dashboard-ui'
