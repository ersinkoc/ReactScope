// ============================================================================
// Core Types
// ============================================================================

export interface ComponentMetrics {
  componentId: string
  componentName: string
  renderCount: number
  totalRenderTime: number
  averageRenderTime: number
  lastRenderTime: number
  wastedRenderCount: number
  mountTime: number | null
  unmountTime: number | null
  isCurrentlyMounted: boolean
  mountCount: number
  propsChangeCount: number
  renderHistory: RenderRecord[]
  parentId: string | null
  childIds: string[]
}

export interface RenderRecord {
  timestamp: number
  duration: number
  phase: 'mount' | 'update'
  wasWasted: boolean
  propsChanged: string[]
}

export interface MetricsStoreData {
  components: Map<string, ComponentMetrics>
  tree: ComponentTree
  timeline: TimelineEvent[]
  sessionStart: number
  lastUpdate: number
}

export interface ComponentTree {
  root: TreeNode | null
  nodeMap: Map<string, TreeNode>
}

export interface TreeNode {
  id: string
  name: string
  children: TreeNode[]
  metrics: ComponentMetrics | null
  depth: number
  isExpanded: boolean
}

// ============================================================================
// Event Types
// ============================================================================

export type KernelEventType =
  | 'render'
  | 'mount'
  | 'unmount'
  | 'props-change'
  | 'state-change'
  | 'metrics-update'
  | 'error'

export interface BaseEvent {
  timestamp: number
}

export interface RenderEvent extends BaseEvent {
  type: 'render'
  componentId: string
  componentName: string
  duration: number
  phase: 'mount' | 'update'
}

export interface MountEvent extends BaseEvent {
  type: 'mount'
  componentId: string
  componentName: string
  parentId: string | null
}

export interface UnmountEvent extends BaseEvent {
  type: 'unmount'
  componentId: string
  componentName: string
}

export interface PropsChangeEvent extends BaseEvent {
  type: 'props-change'
  componentId: string
  componentName: string
  changes: PropsDiff[]
}

export interface StateChangeEvent extends BaseEvent {
  type: 'state-change'
  componentId: string
  componentName: string
  changes: unknown
}

export interface MetricsUpdateEvent extends BaseEvent {
  type: 'metrics-update'
  componentId: string
  metrics: ComponentMetrics
}

export interface ErrorEvent extends BaseEvent {
  type: 'error'
  error: ScopeError
  context: string
}

export type KernelEvent =
  | RenderEvent
  | MountEvent
  | UnmountEvent
  | PropsChangeEvent
  | StateChangeEvent
  | MetricsUpdateEvent
  | ErrorEvent

export interface TimelineEvent {
  id: string
  type: KernelEventType
  timestamp: number
  data: Record<string, unknown>
}

// ============================================================================
// Props Diff Types
// ============================================================================

export interface PropsDiff {
  key: string
  prev: unknown
  next: unknown
  isDeepEqual: boolean
}

export interface PropsSnapshot {
  timestamp: number
  props: Record<string, unknown>
}

export interface PropChangeStats {
  key: string
  changeCount: number
  lastChange: number
}

// ============================================================================
// Wasted Render Types
// ============================================================================

export type WastedRenderReason =
  | 'props-unchanged'
  | 'state-unchanged'
  | 'context-unchanged'

export interface WastedRender {
  timestamp: number
  reason: WastedRenderReason
  details: string
  componentId: string
  componentName: string
}

export interface WastedRenderStats {
  componentId: string
  componentName: string
  wastedCount: number
  wastedPercentage: number
}

// ============================================================================
// Lifecycle Types
// ============================================================================

export type LifecycleEventType = 'mount' | 'unmount'

export interface LifecycleEvent {
  type: LifecycleEventType
  timestamp: number
  componentId: string
  componentName: string
}

// ============================================================================
// Memory Types
// ============================================================================

export interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface MemoryStats {
  current: MemorySnapshot | null
  min: number
  max: number
  average: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface PotentialLeak {
  componentId: string
  componentName: string
  reason: string
  evidence: string
}

// ============================================================================
// Network Types
// ============================================================================

export interface NetworkRequest {
  id: string
  url: string
  method: string
  startTime: number
  endTime: number
  status: number
  size: number
}

export interface Correlation {
  request: NetworkRequest
  renders: RenderEvent[]
  timeGap: number
}

export interface RequestStats {
  totalRequests: number
  averageTime: number
  slowestRequest: NetworkRequest | null
}

// ============================================================================
// Timeline Recording Types
// ============================================================================

export interface TimestampedEvent {
  id: string
  type: string
  timestamp: number
  data: Record<string, unknown>
}

export interface TimelineRecording {
  events: TimestampedEvent[]
  startTime: number
  endTime: number | null
  metadata: {
    componentCount: number
    eventCount: number
    duration: number
  }
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportSummary {
  totalComponents: number
  totalRenders: number
  totalWastedRenders: number
  averageRenderTime: number
  slowestComponents: ComponentSummary[]
  mostWastedComponents: ComponentSummary[]
  timestamp: string
  duration: number
}

export interface ComponentSummary {
  componentId: string
  componentName: string
  renderCount: number
  averageRenderTime: number
  wastedRenderCount: number
}

export interface SerializableMetrics {
  components: Array<{
    id: string
    name: string
    metrics: ComponentMetrics
  }>
  tree: SerializableTree
  timeline: TimelineEvent[]
  session: {
    start: number
    end: number
    duration: number
  }
}

export interface SerializableTree {
  root: SerializableTreeNode | null
}

export interface SerializableTreeNode {
  id: string
  name: string
  children: SerializableTreeNode[]
  depth: number
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface Plugin {
  readonly name: string
  readonly version: string
  install(kernel: Kernel): void
  uninstall(): void
  hooks?: PluginHooks
  api?: Record<string, unknown>
}

export interface PluginHooks {
  onRender?(event: RenderEvent): void
  onMount?(event: MountEvent): void
  onUnmount?(event: UnmountEvent): void
  onPropsChange?(event: PropsChangeEvent): void
  onStateChange?(event: StateChangeEvent): void
  onMetricsUpdate?(event: MetricsUpdateEvent): void
  onError?(event: ErrorEvent): void
}

// ============================================================================
// Kernel Types
// ============================================================================

export interface KernelOptions {
  enabled?: boolean
  trackAllComponents?: boolean
  sampleRate?: number
  maxHistorySize?: number
}

export interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined
  getPlugins(): Plugin[]

  // Event system
  emit(event: KernelEvent): void
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void

  // Metrics
  getMetrics(): MetricsStore
  updateMetrics(componentId: string, partial: Partial<ComponentMetrics>): void
  getComponentMetrics(componentId: string): ComponentMetrics | undefined
  clearMetrics(): void

  // Configuration
  configure(options: KernelOptions): void
  getOptions(): KernelOptions
  isEnabled(): boolean
  enable(): void
  disable(): void

  // Lifecycle
  destroy(): void
}

export interface MetricsStore {
  // Component metrics
  get(componentId: string): ComponentMetrics | undefined
  set(componentId: string, metrics: ComponentMetrics): void
  update(componentId: string, partial: Partial<ComponentMetrics>): void
  delete(componentId: string): void
  getAll(): Map<string, ComponentMetrics>
  clear(): void

  // Tree management
  getTree(): ComponentTree
  updateTree(componentId: string, componentName: string, parentId: string | null): void
  removeFromTree(componentId: string): void

  // Timeline
  addTimelineEvent(event: TimelineEvent): void
  getTimeline(limit?: number): TimelineEvent[]
  clearTimeline(): void

  // Session
  getSessionStart(): number
  getLastUpdate(): number
  getSessionDuration(): number

  // Data access
  getData(): MetricsStoreData
}

export interface EventBus {
  emit(event: KernelEvent): void
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void
  off(eventType: string, handler: Function): void
  once<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void
  clear(): void
  getListenerCount(eventType?: string): number
}

export interface PluginRegistry {
  register(plugin: Plugin): void
  unregister(name: string): void
  get<T extends Plugin>(name: string): T | undefined
  getAll(): Plugin[]
  has(name: string): boolean
  clear(): void
}

// ============================================================================
// React Types
// ============================================================================

export interface ReactScopeProviderProps {
  children: React.ReactNode
  enabled?: boolean
  plugins?: Plugin[]
  onReady?: (kernel: Kernel) => void
  options?: KernelOptions
}

export interface ScopeProps {
  children: React.ReactNode
  name?: string
  onRender?: (metrics: ComponentMetrics) => void
  trackProps?: boolean
  trackState?: boolean
}

export interface UseScopeOptions {
  trackProps?: boolean
  trackState?: boolean
  onRender?: (metrics: ComponentMetrics) => void
}

export interface ScopeHandle {
  readonly componentId: string
  readonly renderCount: number
  readonly lastRenderTime: number
  readonly averageRenderTime: number
  readonly wastedRenders: number
  readonly isTracking: boolean
  trackRender(duration: number, phase: 'mount' | 'update'): void
  trackPropsChange(changes: PropsDiff[]): void
}

export interface WithScopeOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  onRender?: (metrics: ComponentMetrics) => void
}

// ============================================================================
// Dashboard Types
// ============================================================================

export type DashboardPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type DashboardTheme = 'dark' | 'light' | 'auto'

export interface DashboardOptions {
  position?: DashboardPosition
  shortcut?: string
  draggable?: boolean
  resizable?: boolean
  defaultWidth?: number
  defaultHeight?: number
  defaultCollapsed?: boolean
  theme?: DashboardTheme
}

export interface DashboardState {
  isVisible: boolean
  isCollapsed: boolean
  position: DashboardPosition
  width: number
  height: number
  x: number
  y: number
  theme: DashboardTheme
  selectedComponentId: string | null
  searchQuery: string
  activeTab: string
}

// ============================================================================
// Console Reporter Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface ConsoleReporterOptions {
  logLevel?: LogLevel
  groupByComponent?: boolean
  includeTimestamp?: boolean
  formatOutput?: boolean
  filter?: (event: KernelEvent) => boolean
}

// ============================================================================
// Error Types
// ============================================================================

export class ScopeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ScopeError'
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type Unsubscribe = () => void

export interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

export interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

export interface TimelineOptions {
  start?: number
  end?: number
  limit?: number
  types?: KernelEventType[]
}
