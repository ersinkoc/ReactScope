# ReactScope - Complete Package Specification

## Overview

**Package Name**: `@oxog/reactscope`
**Version**: 1.0.0
**License**: MIT
**Author**: ersinkoc
**Repository**: https://github.com/ersinkoc/reactscope
**Documentation**: https://reactscope.oxog.dev

ReactScope is a zero-dependency React performance profiler with a micro-kernel plugin architecture. It provides comprehensive render tracking, props diffing, wasted render detection, memory monitoring, and network correlation through a modular plugin system.

---

## Core Principles

### 1. Zero Dependencies
- No runtime dependencies whatsoever
- All functionality implemented from scratch
- `dependencies: {}` in package.json must remain empty

### 2. Micro-Kernel Architecture
- Minimal kernel handling only core responsibilities
- All features implemented as plugins
- Event-driven communication between plugins
- Centralized metrics store

### 3. Performance First
- Profiler must not impact application performance
- Use `requestIdleCallback` for non-critical work
- Batch updates and throttle renders
- Sample rate configuration for high-frequency scenarios

### 4. Complete Type Safety
- TypeScript strict mode enabled
- No `any` types except where absolutely necessary
- Full type inference for plugin APIs

---

## Module Specifications

### 1. Kernel Module (`/src/kernel/`)

#### 1.1 Event Bus (`event-bus.ts`)
```typescript
interface EventBus {
  emit(event: KernelEvent): void
  on<T extends KernelEvent>(eventType: T['type'], handler: (event: T) => void): () => void
  off(eventType: string, handler: Function): void
  once<T extends KernelEvent>(eventType: T['type'], handler: (event: T) => void): () => void
  clear(): void
  getListenerCount(eventType?: string): number
}
```

**Responsibilities**:
- Pub/sub event system for kernel events
- Type-safe event handling
- Memory-efficient listener management
- Support for one-time listeners

#### 1.2 Metrics Store (`metrics-store.ts`)
```typescript
interface MetricsStore {
  // Component metrics
  get(componentId: string): ComponentMetrics | undefined
  set(componentId: string, metrics: ComponentMetrics): void
  update(componentId: string, partial: Partial<ComponentMetrics>): void
  delete(componentId: string): void
  getAll(): Map<string, ComponentMetrics>
  clear(): void

  // Tree management
  getTree(): ComponentTree
  updateTree(componentId: string, parentId: string | null): void
  removeFromTree(componentId: string): void

  // Timeline
  addTimelineEvent(event: TimelineEvent): void
  getTimeline(options?: TimelineOptions): TimelineEvent[]
  clearTimeline(): void

  // Session
  getSessionStart(): number
  getLastUpdate(): number
  getSessionDuration(): number
}
```

**Responsibilities**:
- Central storage for all metrics
- Component tree management
- Timeline event storage with limits
- Session tracking

#### 1.3 Plugin Registry (`plugin-registry.ts`)
```typescript
interface PluginRegistry {
  register(plugin: Plugin): void
  unregister(name: string): void
  get<T extends Plugin>(name: string): T | undefined
  getAll(): Plugin[]
  has(name: string): boolean
  clear(): void
}
```

**Responsibilities**:
- Plugin lifecycle management
- Dependency resolution (future)
- Plugin API access

#### 1.4 Kernel (`kernel.ts`)
```typescript
interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined

  // Event system
  emit(event: KernelEvent): void
  on<T extends KernelEvent>(eventType: T['type'], handler: (event: T) => void): () => void

  // Metrics
  getMetrics(): MetricsStoreInterface
  updateMetrics(componentId: string, metrics: Partial<ComponentMetrics>): void
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
```

**Responsibilities**:
- Orchestrate all kernel components
- Provide unified API for plugins
- Handle configuration
- Manage lifecycle

---

### 2. Plugin Specifications

#### 2.1 Plugin Interface
```typescript
interface Plugin {
  // Identity
  readonly name: string
  readonly version: string

  // Lifecycle
  install(kernel: Kernel): void
  uninstall(): void

  // Event hooks
  hooks?: PluginHooks

  // Public API
  api?: Record<string, unknown>
}

interface PluginHooks {
  onRender?(event: RenderEvent): void
  onMount?(event: MountEvent): void
  onUnmount?(event: UnmountEvent): void
  onPropsChange?(event: PropsChangeEvent): void
  onStateChange?(event: StateChangeEvent): void
  onMetricsUpdate?(metrics: MetricsStore): void
  onError?(error: ScopeError): void
}
```

#### 2.2 Render Tracker Plugin
```typescript
interface RenderTrackerPlugin extends Plugin {
  name: 'render-tracker'
  api: {
    getRenderCount(componentId: string): number
    getAverageRenderTime(componentId: string): number
    getTotalRenderTime(componentId: string): number
    getLastRenderTime(componentId: string): number
    getRenderHistory(componentId: string): RenderRecord[]
    getSlowRenders(threshold?: number): RenderRecord[]
    getRendersByTimeRange(start: number, end: number): RenderRecord[]
  }
}
```

**Features**:
- Track render count per component
- Measure render duration
- Maintain render history
- Identify slow renders

#### 2.3 Props Differ Plugin
```typescript
interface PropsDifferPlugin extends Plugin {
  name: 'props-differ'
  api: {
    getPropsHistory(componentId: string): PropsSnapshot[]
    getLastChange(componentId: string): PropsDiff[] | null
    getChangeFrequency(componentId: string, propKey: string): number
    getMostChangedProps(componentId: string, limit?: number): PropChangeStats[]
    compareProps(prev: unknown, next: unknown): PropsDiff[]
  }
}
```

**Features**:
- Deep props comparison
- Track prop change history
- Analyze change patterns
- Identify frequently changing props

#### 2.4 Wasted Render Detector Plugin
```typescript
interface WastedRenderDetectorPlugin extends Plugin {
  name: 'wasted-render-detector'
  api: {
    getWastedRenders(componentId: string): WastedRender[]
    getWastedRenderCount(componentId: string): number
    getWastedRenderPercentage(componentId: string): number
    getAllWastedRenders(): Map<string, WastedRender[]>
    getMostWastefulComponents(limit?: number): WastedRenderStats[]
    clearWastedRenders(componentId?: string): void
  }
}
```

**Features**:
- Detect unchanged props/state renders
- Calculate waste percentage
- Rank components by waste
- Provide optimization suggestions

#### 2.5 Lifecycle Tracker Plugin
```typescript
interface LifecycleTrackerPlugin extends Plugin {
  name: 'lifecycle-tracker'
  api: {
    getMountTime(componentId: string): number | null
    getUnmountTime(componentId: string): number | null
    getLifetime(componentId: string): number | null
    getMountCount(componentId: string): number
    isCurrentlyMounted(componentId: string): boolean
    getLifecycleHistory(componentId: string): LifecycleEvent[]
    getMountedComponents(): string[]
    getAverageLifetime(componentId: string): number
  }
}
```

**Features**:
- Track mount/unmount events
- Calculate component lifetime
- Monitor remount patterns
- List currently mounted components

#### 2.6 Console Reporter Plugin
```typescript
interface ConsoleReporterPlugin extends Plugin {
  name: 'console-reporter'
  api: {
    setLogLevel(level: LogLevel): void
    setFilter(filter: EventFilter): void
    pause(): void
    resume(): void
    isPaused(): boolean
    log(message: string, level?: LogLevel): void
  }
}

interface ConsoleReporterOptions {
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  groupByComponent: boolean
  includeTimestamp: boolean
  formatOutput: boolean
  filter?: (event: KernelEvent) => boolean
}
```

**Features**:
- Configurable log levels
- Component grouping
- Timestamp formatting
- Custom filtering

#### 2.7 JSON Exporter Plugin
```typescript
interface JSONExporterPlugin extends Plugin {
  name: 'json-exporter'
  api: {
    exportAll(): string
    exportComponent(componentId: string): string
    exportSummary(): ExportSummary
    downloadJSON(filename?: string): void
    getSerializableMetrics(): SerializableMetrics
    exportToClipboard(): Promise<void>
  }
}
```

**Features**:
- Full metrics export
- Component-specific export
- Summary generation
- File download
- Clipboard support

#### 2.8 Timeline Recorder Plugin
```typescript
interface TimelineRecorderPlugin extends Plugin {
  name: 'timeline-recorder'
  api: {
    startRecording(): void
    stopRecording(): void
    isRecording(): boolean
    getRecording(): TimelineRecording
    clearRecording(): void
    exportRecording(): string
    getTimeRange(): { start: number; end: number }
    getEventsByType(type: string): TimestampedEvent[]
    seekTo(timestamp: number): TimestampedEvent[]
  }
}
```

**Features**:
- Start/stop recording
- Event playback
- Time range queries
- Export functionality

#### 2.9 Memory Tracker Plugin
```typescript
interface MemoryTrackerPlugin extends Plugin {
  name: 'memory-tracker'
  api: {
    getCurrentMemory(): MemorySnapshot | null
    getMemoryHistory(): MemorySnapshot[]
    getMemoryTrend(): 'increasing' | 'stable' | 'decreasing'
    detectPotentialLeaks(): PotentialLeak[]
    startMonitoring(intervalMs?: number): void
    stopMonitoring(): void
    isMonitoring(): boolean
    getMemoryStats(): MemoryStats
  }
}
```

**Features**:
- Memory usage tracking (Chrome)
- Trend analysis
- Leak detection heuristics
- Graceful degradation

#### 2.10 Network Correlator Plugin
```typescript
interface NetworkCorrelatorPlugin extends Plugin {
  name: 'network-correlator'
  api: {
    getRequestsForComponent(componentId: string): NetworkRequest[]
    getRendersForRequest(requestId: string): RenderEvent[]
    getCorrelations(): Correlation[]
    startCapturing(): void
    stopCapturing(): void
    isCapturing(): boolean
    getRequestStats(): RequestStats
  }
}
```

**Features**:
- Capture network requests
- Correlate with renders
- Analyze patterns
- Request statistics

#### 2.11 Dashboard UI Plugin
```typescript
interface DashboardUIPlugin extends Plugin {
  name: 'dashboard-ui'
  api: {
    show(): void
    hide(): void
    toggle(): void
    isVisible(): boolean
    setPosition(position: DashboardPosition): void
    setTheme(theme: 'dark' | 'light' | 'auto'): void
    expand(): void
    collapse(): void
    isCollapsed(): boolean
    focusSearch(): void
    selectComponent(componentId: string): void
  }
}

interface DashboardUIOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut: string
  draggable: boolean
  resizable: boolean
  defaultWidth: number
  defaultHeight: number
  defaultCollapsed: boolean
  theme: 'dark' | 'light' | 'auto'
}
```

**Features**:
- Shadow DOM isolation
- Component tree view
- Real-time metrics
- Timeline visualization
- Memory charts
- Network panel
- Search/filter
- Keyboard navigation
- Drag and resize

---

### 3. React Integration (`/src/react/`)

#### 3.1 ReactScopeProvider
```typescript
interface ReactScopeProviderProps {
  children: React.ReactNode
  enabled?: boolean
  plugins?: Plugin[]
  onReady?: (kernel: Kernel) => void
  options?: {
    trackAllComponents?: boolean
    sampleRate?: number
    maxHistorySize?: number
  }
}
```

#### 3.2 Scope Component
```typescript
interface ScopeProps {
  children: React.ReactNode
  name?: string
  onRender?: (metrics: ComponentMetrics) => void
  trackProps?: boolean
  trackState?: boolean
}
```

#### 3.3 Hooks
```typescript
// Main profiling hook
function useScope(name: string, options?: UseScopeOptions): ScopeHandle

interface ScopeHandle {
  readonly renderCount: number
  readonly lastRenderTime: number
  readonly averageRenderTime: number
  readonly wastedRenders: number
  readonly isTracking: boolean
  trackRender(duration: number): void
  trackPropsChange(changes: PropsDiff[]): void
}

// Metrics reading hook
function useScopeMetrics(componentId: string): ComponentMetrics | undefined

// Context access hook
function useScopeContext(): Kernel
```

#### 3.4 HOC
```typescript
function withScope<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithScopeOptions
): React.ComponentType<P>

interface WithScopeOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  onRender?: (metrics: ComponentMetrics) => void
}
```

---

### 4. Utility Functions (`/src/utils/`)

#### 4.1 Deep Equal (`deep-equal.ts`)
```typescript
function deepEqual(a: unknown, b: unknown): boolean
```
- Handle all primitive types
- Handle objects and arrays
- Handle Date, RegExp, Map, Set
- Handle circular references
- Handle undefined vs missing keys

#### 4.2 Shallow Equal (`shallow-equal.ts`)
```typescript
function shallowEqual(a: unknown, b: unknown): boolean
```
- Compare first level only
- Handle null/undefined
- Fast path for same reference

#### 4.3 UID Generator (`uid.ts`)
```typescript
function uid(): string
function createIdGenerator(prefix?: string): () => string
```
- Collision-resistant
- Short and readable
- Prefix support

#### 4.4 Throttle (`throttle.ts`)
```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: ThrottleOptions
): T & { cancel(): void; flush(): void }
```

#### 4.5 Debounce (`debounce.ts`)
```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: DebounceOptions
): T & { cancel(): void; flush(): void }
```

#### 4.6 Format (`format.ts`)
```typescript
function formatDuration(ms: number): string
function formatBytes(bytes: number): string
function formatNumber(num: number): string
function formatPercentage(value: number): string
function formatTimestamp(timestamp: number): string
```

#### 4.7 Tree (`tree.ts`)
```typescript
interface TreeUtils {
  createNode(id: string, name: string, parentId: string | null): TreeNode
  addChild(parent: TreeNode, child: TreeNode): void
  removeNode(tree: ComponentTree, nodeId: string): void
  findNode(tree: ComponentTree, nodeId: string): TreeNode | undefined
  traverseDepthFirst(tree: ComponentTree, callback: (node: TreeNode) => void): void
  traverseBreadthFirst(tree: ComponentTree, callback: (node: TreeNode) => void): void
  getAncestors(tree: ComponentTree, nodeId: string): TreeNode[]
  getDescendants(tree: ComponentTree, nodeId: string): TreeNode[]
  flattenTree(tree: ComponentTree): TreeNode[]
}
```

---

### 5. Type Definitions (`/src/types.ts`)

Complete type definitions for:
- Kernel types
- Event types
- Metrics types
- Plugin types
- React component props
- Configuration options

All types must be exported for consumer use.

---

## Event Flow

```
Component Render
       ↓
React Profiler API / useScope hook
       ↓
Kernel.emit(RenderEvent)
       ↓
EventBus distributes to plugins
       ↓
┌──────────────────────────────────────────┐
│  render-tracker  →  updates render count │
│  props-differ    →  computes diff        │
│  wasted-render   →  checks if wasted     │
│  console-reporter→  logs to console      │
│  timeline-recorder→ records event        │
└──────────────────────────────────────────┘
       ↓
MetricsStore.update()
       ↓
Dashboard UI updates (throttled)
```

---

## Build Configuration

### package.json
```json
{
  "name": "@oxog/reactscope",
  "version": "1.0.0",
  "description": "Zero-dependency React performance profiler with micro-kernel plugin architecture",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./plugins/*": {
      "import": "./dist/plugins/*.js",
      "require": "./dist/plugins/*.cjs",
      "types": "./dist/plugins/*.d.ts"
    }
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitest/coverage-v8": "^1.0.0",
    "happy-dom": "^12.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {}
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Testing Requirements

### Unit Tests
- Every function must have tests
- Every branch must be covered
- Edge cases must be tested
- Error conditions must be tested

### Integration Tests
- Provider + hooks integration
- Plugin interactions
- Event flow verification
- Dashboard rendering

### Test Utilities
- Mock kernel
- Test components
- Fixture data
- Custom matchers

---

## Performance Budgets

- Bundle size: < 30KB gzipped (core)
- Bundle size: < 50KB gzipped (with dashboard)
- Time to first metric: < 5ms
- Overhead per render: < 0.1ms
- Memory overhead: < 5MB for 1000 components

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Graceful degradation for:
- `performance.memory` (Chrome only)
- `requestIdleCallback` (fallback to setTimeout)
