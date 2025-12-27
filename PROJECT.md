# ReactScope - Zero-Dependency React Performance Profiler

## Package Identity

- **NPM Package**: `@oxog/reactscope`
- **GitHub Repository**: `https://github.com/ersinkoc/reactscope`
- **Documentation Site**: `https://reactscope.oxog.dev`
- **License**: MIT
- **Author**: ersinkoc

**NO social media, Discord, email, or external links.**

## Package Description

Zero-dependency React performance profiler with micro-kernel plugin architecture.

ReactScope is a comprehensive performance profiling toolkit for React applications. Built on a micro-kernel architecture, it provides render tracking, props diffing, wasted render detection, memory monitoring, and network correlation through a modular plugin system. Features an elegant dashboard UI with component tree visualization, all without any runtime dependencies.

---

## NON-NEGOTIABLE RULES

These rules are ABSOLUTE and must be followed without exception:

### 1. ZERO DEPENDENCIES
```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```
Implement EVERYTHING from scratch. No runtime dependencies allowed.

### 2. 100% TEST COVERAGE
- Every line of code must be tested
- Every branch must be tested
- All tests must pass (100% success rate)
- Use Vitest for testing

### 3. DEVELOPMENT WORKFLOW
Create these documents FIRST, before any code:
1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions
3. **TASKS.md** - Ordered task list with dependencies

Only after these documents are complete, implement the code following TASKS.md sequentially.

### 4. TYPESCRIPT STRICT MODE
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 5. NO EXTERNAL LINKS
- ❌ No social media (Twitter, LinkedIn, etc.)
- ❌ No Discord/Slack links
- ❌ No email addresses
- ❌ No donation/sponsor links
- ✅ Only GitHub repo and documentation site allowed

---

## ARCHITECTURE: MICRO-KERNEL + PLUGIN SYSTEM

This is the core architectural pattern. Everything is built around this.

### Kernel Responsibilities
```typescript
// The kernel is minimal and only handles:
interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined
  
  // Event system
  emit(event: KernelEvent): void
  on(eventType: string, handler: EventHandler): Unsubscribe
  
  // Metrics store
  getMetrics(): MetricsStore
  updateMetrics(componentId: string, metrics: ComponentMetrics): void
  clearMetrics(): void
  
  // Configuration
  configure(options: KernelOptions): void
  isEnabled(): boolean
}
```

### Plugin Interface
```typescript
interface Plugin {
  // Identity
  name: string
  version: string
  
  // Lifecycle
  install(kernel: Kernel): void
  uninstall(): void
  
  // Event hooks (all optional)
  hooks?: {
    onRender?: (event: RenderEvent) => void
    onMount?: (event: MountEvent) => void
    onUnmount?: (event: UnmountEvent) => void
    onPropsChange?: (event: PropsChangeEvent) => void
    onStateChange?: (event: StateChangeEvent) => void
    onMetricsUpdate?: (metrics: MetricsStore) => void
    onError?: (error: ScopeError) => void
  }
  
  // Plugin can expose its own API
  api?: Record<string, unknown>
}
```

### Event Types
```typescript
type KernelEvent = 
  | RenderEvent
  | MountEvent
  | UnmountEvent
  | PropsChangeEvent
  | StateChangeEvent
  | MetricsUpdateEvent
  | ErrorEvent

interface RenderEvent {
  type: 'render'
  componentId: string
  componentName: string
  timestamp: number
  duration: number
  phase: 'mount' | 'update'
}

interface PropsChangeEvent {
  type: 'props-change'
  componentId: string
  componentName: string
  changes: PropsDiff[]
  timestamp: number
}

interface PropsDiff {
  key: string
  prev: unknown
  next: unknown
  isDeepEqual: boolean
}
```

---

## CORE PLUGINS (10 Total)

All these plugins MUST be implemented as part of the package:

### 1. render-tracker
Tracks render count and duration for each component.

```typescript
interface RenderTrackerAPI {
  getRenderCount(componentId: string): number
  getAverageRenderTime(componentId: string): number
  getTotalRenderTime(componentId: string): number
  getLastRenderTime(componentId: string): number
  getRenderHistory(componentId: string): RenderRecord[]
}
```

### 2. props-differ
Analyzes props changes between renders.

```typescript
interface PropsDifferAPI {
  getPropsHistory(componentId: string): PropsSnapshot[]
  getLastChange(componentId: string): PropsDiff[] | null
  getChangeFrequency(componentId: string, propKey: string): number
}
```

### 3. wasted-render-detector
Detects renders where props/state didn't actually change (shallow equal).

```typescript
interface WastedRenderDetectorAPI {
  getWastedRenders(componentId: string): WastedRender[]
  getWastedRenderCount(componentId: string): number
  getWastedRenderPercentage(componentId: string): number
  getAllWastedRenders(): Map<string, WastedRender[]>
}

interface WastedRender {
  timestamp: number
  reason: 'props-unchanged' | 'state-unchanged' | 'context-unchanged'
  details: string
}
```

### 4. lifecycle-tracker
Tracks mount/unmount events and component lifecycle.

```typescript
interface LifecycleTrackerAPI {
  getMountTime(componentId: string): number | null
  getUnmountTime(componentId: string): number | null
  getLifetime(componentId: string): number | null
  getMountCount(componentId: string): number
  isCurrentlyMounted(componentId: string): boolean
  getLifecycleHistory(componentId: string): LifecycleEvent[]
}
```

### 5. dashboard-ui
The overlay panel with full visualization.

```typescript
interface DashboardUIOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut: string // e.g., 'ctrl+shift+r'
  draggable: boolean
  resizable: boolean
  defaultWidth: number
  defaultHeight: number
  defaultCollapsed: boolean
  theme: 'dark' | 'light' | 'auto'
}

// Dashboard features:
// - Component tree visualization with hierarchy
// - Real-time metrics display
// - Wasted render warnings (⚠️ icon)
// - Slow render alerts (🔴 icon)
// - Search/filter components
// - Expand/collapse tree nodes
// - Click component to see details
// - Keyboard navigation
```

**CRITICAL: Dashboard must render inside Shadow DOM to isolate styles from host app.**

### 6. console-reporter
Logs profiling data to browser console.

```typescript
interface ConsoleReporterOptions {
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  groupByComponent: boolean
  includeTimestamp: boolean
  formatOutput: boolean // Pretty print
  filter?: (event: KernelEvent) => boolean
}
```

### 7. json-exporter
Exports metrics as JSON for CI/CD integration.

```typescript
interface JSONExporterAPI {
  exportAll(): string
  exportComponent(componentId: string): string
  exportSummary(): ExportSummary
  downloadJSON(filename?: string): void
  getSerializableMetrics(): SerializableMetrics
}

interface ExportSummary {
  totalComponents: number
  totalRenders: number
  totalWastedRenders: number
  averageRenderTime: number
  slowestComponents: ComponentSummary[]
  mostWastedComponents: ComponentSummary[]
  timestamp: string
  duration: number // Total profiling session duration
}
```

### 8. timeline-recorder
Records events over time for playback/analysis.

```typescript
interface TimelineRecorderAPI {
  startRecording(): void
  stopRecording(): void
  isRecording(): boolean
  getRecording(): TimelineRecording
  clearRecording(): void
  exportRecording(): string
  getTimeRange(): { start: number; end: number }
}

interface TimelineRecording {
  events: TimestampedEvent[]
  startTime: number
  endTime: number | null
  metadata: {
    componentCount: number
    eventCount: number
    duration: number
  }
}
```

### 9. memory-tracker
Monitors memory usage patterns.

```typescript
interface MemoryTrackerAPI {
  getCurrentMemory(): MemorySnapshot | null
  getMemoryHistory(): MemorySnapshot[]
  getMemoryTrend(): 'increasing' | 'stable' | 'decreasing'
  detectPotentialLeaks(): PotentialLeak[]
  startMonitoring(intervalMs?: number): void
  stopMonitoring(): void
}

interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PotentialLeak {
  componentId: string
  componentName: string
  reason: string
  evidence: string
}
```

**Note: Uses `performance.memory` API (Chrome only). Gracefully degrades on other browsers.**

### 10. network-correlator
Correlates renders with network requests.

```typescript
interface NetworkCorrelatorAPI {
  getRequestsForComponent(componentId: string): NetworkRequest[]
  getRendersForRequest(requestId: string): RenderEvent[]
  getCorrelations(): Correlation[]
  startCapturing(): void
  stopCapturing(): void
}

interface NetworkRequest {
  id: string
  url: string
  method: string
  startTime: number
  endTime: number
  status: number
  size: number
}

interface Correlation {
  request: NetworkRequest
  renders: RenderEvent[]
  timeGap: number // ms between request complete and render
}
```

**Note: Uses `PerformanceObserver` API to capture fetch/XHR requests.**

---

## PUBLIC API

### React Components

```tsx
// Main Provider
import { ReactScopeProvider } from '@oxog/reactscope'

<ReactScopeProvider
  enabled={true}                    // Enable/disable profiling
  plugins={[customPlugin]}          // Additional plugins
  onReady={(kernel) => {}}          // Callback when ready
  options={{
    trackAllComponents: false,      // Auto-track all components
    sampleRate: 1,                  // 0-1, for performance
    maxHistorySize: 1000,           // Limit stored events
  }}
>
  <App />
</ReactScopeProvider>

// Dashboard Component
import { Dashboard } from '@oxog/reactscope'

<Dashboard
  position="bottom-right"
  shortcut="ctrl+shift+r"
  draggable={true}
  resizable={true}
  defaultCollapsed={false}
/>

// Scope Wrapper Component
import { Scope } from '@oxog/reactscope'

<Scope 
  name="ProductList"
  onRender={(metrics) => console.log(metrics)}
  trackProps={true}
>
  <ProductList items={items} />
</Scope>
```

### React Hooks

```tsx
import { useScope, useScopeMetrics, useScopeContext } from '@oxog/reactscope'

// Basic profiling hook
function MyComponent() {
  const scope = useScope('MyComponent', {
    trackProps: true,
    trackState: true,
  })
  
  // Access metrics
  scope.renderCount      // number
  scope.lastRenderTime   // number (ms)
  scope.averageRenderTime // number (ms)
  scope.wastedRenders    // number
  
  return <div>...</div>
}

// Metrics-only hook (read-only, no tracking)
function MetricsDisplay() {
  const metrics = useScopeMetrics('TargetComponent')
  return <div>Renders: {metrics?.renderCount ?? 0}</div>
}

// Access kernel directly
function AdvancedUsage() {
  const kernel = useScopeContext()
  const allMetrics = kernel.getMetrics()
}
```

### HOC

```tsx
import { withScope } from '@oxog/reactscope'

const ProfiledComponent = withScope(MyComponent, {
  name: 'MyComponent',        // Optional, defaults to displayName
  trackProps: true,
  trackState: true,
  onRender: (metrics) => {},
})

export default ProfiledComponent
```

### Programmatic API

```tsx
import { 
  getKernel,
  getMetrics, 
  exportMetrics, 
  clearMetrics,
  createPlugin,
} from '@oxog/reactscope'

// Access kernel
const kernel = getKernel()

// Get all metrics
const metrics = getMetrics()

// Export as JSON
const json = exportMetrics()

// Clear all data
clearMetrics()

// Create custom plugin
const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    onRender: (event) => {
      console.log(`${event.componentName} rendered in ${event.duration}ms`)
    },
  },
  api: {
    customMethod: () => 'custom data',
  },
})
```

---

## TYPE DEFINITIONS

```typescript
// Core types
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

export interface MetricsStore {
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
  metrics: ComponentMetrics
  depth: number
  isExpanded: boolean
}

// Plugin types
export interface Plugin { /* as defined above */ }
export interface PluginHooks { /* as defined above */ }
export type KernelEvent = /* as defined above */

// Options types
export interface ReactScopeOptions {
  enabled?: boolean
  plugins?: Plugin[]
  trackAllComponents?: boolean
  sampleRate?: number
  maxHistorySize?: number
}

export interface DashboardOptions { /* as defined above */ }
export interface ScopeOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  onRender?: (metrics: ComponentMetrics) => void
}
```

---

## DASHBOARD UI SPECIFICATION

### Component Tree Visualization

```
┌─ App (renders: 12, avg: 2.3ms)
├─┬─ Header (renders: 3, avg: 0.8ms)
│ ├── Logo (renders: 1, avg: 0.2ms)
│ └── Nav (renders: 3, avg: 0.5ms) ⚠️ wasted: 2
├─┬─ ProductList (renders: 8, avg: 15ms) 🔴 slow
│ ├── ProductCard ×24 (renders: 192 total, avg: 1.2ms)
│ │   └── [Expand to see individual cards]
│ └── Pagination (renders: 8, avg: 0.3ms)
└── Footer (renders: 1, avg: 0.4ms)
```

### Dashboard Panels

1. **Tree View** - Component hierarchy with metrics
2. **Timeline** - Render events over time (graph)
3. **Memory** - Memory usage chart
4. **Network** - Request/render correlation
5. **Alerts** - Wasted renders, slow components
6. **Details** - Selected component deep dive

### Dashboard Features

- **Shadow DOM**: Complete style isolation
- **Draggable**: Click and drag title bar
- **Resizable**: Drag corners/edges
- **Collapsible**: Minimize to icon
- **Keyboard Shortcut**: `Ctrl+Shift+R` to toggle
- **Search**: Filter components by name
- **Theme**: Dark mode (matches spec colors)
- **Tabs**: Switch between panels
- **Export Button**: Download JSON report

### Dashboard Color Coding

```css
/* Performance indicators */
--fast: #22c55e;      /* < 5ms - green */
--medium: #eab308;    /* 5-16ms - yellow */
--slow: #ef4444;      /* > 16ms - red */

/* Wasted render indicator */
--wasted: #f97316;    /* orange warning */
```

---

## TECHNICAL REQUIREMENTS

- **Runtime**: Browser only
- **React Version**: 17+ (uses modern React APIs)
- **Module Format**: ESM + CJS (dual package)
- **Node.js Version**: >= 18 (for build/test)
- **TypeScript Version**: >= 5.0, strict mode

### Browser APIs Used

- `performance.now()` - High-resolution timing
- `performance.memory` - Memory tracking (Chrome only, graceful degradation)
- `PerformanceObserver` - Network request tracking
- `requestIdleCallback` - Non-blocking metric updates
- `IntersectionObserver` - Dashboard visibility optimization
- `ResizeObserver` - Dashboard resize handling
- `MutationObserver` - DOM change detection (for tree building)

### React Integration

- Use React's built-in Profiler API where possible
- Wrap components with minimal overhead
- Support React.memo, forwardRef, lazy
- Handle Suspense boundaries
- Support Concurrent Mode

---

## PROJECT STRUCTURE

```
reactscope/
├── src/
│   ├── index.ts                    # Main entry, exports
│   ├── types.ts                    # All type definitions
│   │
│   ├── kernel/                     # Micro-kernel core
│   │   ├── index.ts
│   │   ├── kernel.ts               # Kernel implementation
│   │   ├── event-bus.ts            # Event pub/sub system
│   │   ├── metrics-store.ts        # Centralized metrics
│   │   └── plugin-registry.ts      # Plugin management
│   │
│   ├── plugins/                    # Core plugins
│   │   ├── index.ts
│   │   ├── render-tracker/
│   │   │   ├── index.ts
│   │   │   └── render-tracker.ts
│   │   ├── props-differ/
│   │   │   ├── index.ts
│   │   │   └── props-differ.ts
│   │   ├── wasted-render-detector/
│   │   │   ├── index.ts
│   │   │   └── wasted-render-detector.ts
│   │   ├── lifecycle-tracker/
│   │   │   ├── index.ts
│   │   │   └── lifecycle-tracker.ts
│   │   ├── dashboard-ui/
│   │   │   ├── index.ts
│   │   │   ├── dashboard.tsx
│   │   │   ├── components/
│   │   │   │   ├── tree-view.tsx
│   │   │   │   ├── timeline-chart.tsx
│   │   │   │   ├── memory-chart.tsx
│   │   │   │   ├── network-panel.tsx
│   │   │   │   ├── alerts-panel.tsx
│   │   │   │   └── details-panel.tsx
│   │   │   ├── styles/
│   │   │   │   └── dashboard.css    # Inlined in Shadow DOM
│   │   │   └── utils/
│   │   │       ├── shadow-dom.ts
│   │   │       ├── draggable.ts
│   │   │       └── resizable.ts
│   │   ├── console-reporter/
│   │   │   ├── index.ts
│   │   │   └── console-reporter.ts
│   │   ├── json-exporter/
│   │   │   ├── index.ts
│   │   │   └── json-exporter.ts
│   │   ├── timeline-recorder/
│   │   │   ├── index.ts
│   │   │   └── timeline-recorder.ts
│   │   ├── memory-tracker/
│   │   │   ├── index.ts
│   │   │   └── memory-tracker.ts
│   │   └── network-correlator/
│   │       ├── index.ts
│   │       └── network-correlator.ts
│   │
│   ├── react/                      # React integration
│   │   ├── index.ts
│   │   ├── provider.tsx            # ReactScopeProvider
│   │   ├── context.ts              # React context
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-scope.ts
│   │   │   ├── use-scope-metrics.ts
│   │   │   └── use-scope-context.ts
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── scope.tsx           # Scope wrapper
│   │   │   └── dashboard.tsx       # Dashboard component
│   │   └── hoc/
│   │       ├── index.ts
│   │       └── with-scope.tsx
│   │
│   └── utils/                      # Internal utilities
│       ├── index.ts
│       ├── deep-equal.ts           # Deep equality check
│       ├── shallow-equal.ts        # Shallow equality
│       ├── uid.ts                  # Unique ID generator
│       ├── throttle.ts             # Throttle function
│       ├── debounce.ts             # Debounce function
│       ├── format.ts               # Number/time formatting
│       └── tree.ts                 # Tree data structure
│
├── tests/
│   ├── unit/
│   │   ├── kernel/
│   │   ├── plugins/
│   │   ├── react/
│   │   └── utils/
│   ├── integration/
│   │   ├── provider.test.tsx
│   │   ├── hooks.test.tsx
│   │   ├── plugins.test.ts
│   │   └── dashboard.test.tsx
│   └── fixtures/
│       ├── test-components.tsx
│       └── mock-data.ts
│
├── examples/
│   ├── basic/
│   │   ├── index.html
│   │   └── src/
│   ├── advanced/
│   │   ├── index.html
│   │   └── src/
│   └── with-custom-plugin/
│       ├── index.html
│       └── src/
│
├── website/                        # Documentation site
│   ├── index.html                  # Landing page
│   ├── docs/
│   │   ├── index.html
│   │   ├── getting-started.html
│   │   ├── api/
│   │   │   ├── index.html
│   │   │   ├── provider.html
│   │   │   ├── hooks.html
│   │   │   ├── components.html
│   │   │   └── plugins.html
│   │   ├── examples/
│   │   │   ├── index.html
│   │   │   ├── basic.html
│   │   │   ├── custom-plugin.html
│   │   │   └── production.html
│   │   └── playground/
│   │       └── index.html
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── images/
│   │       ├── og-image.png
│   │       └── favicon.svg
│   └── 404.html
│
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## DOCUMENTATION WEBSITE

Build a complete documentation site in `/website` for `https://reactscope.oxog.dev`

### Technology Stack
- **Tailwind CSS** (via CDN)
- **Alpine.js** (via CDN) 
- **Prism.js** for syntax highlighting
- **Static HTML** (no build step)

### Design Theme (Dark)
```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-tertiary: #1f1f1f;
--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--accent: #3b82f6;
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
```

### Required Pages

1. **Landing Page** - Hero, features, quick install, live demo preview
2. **Getting Started** - Installation, basic setup, first profile
3. **API Reference** - Full documentation for all exports
4. **Plugin Guide** - How to create custom plugins
5. **Examples** - Basic, advanced, production use cases
6. **Playground** - Interactive code editor with live preview

### Special Features

- Copy-to-clipboard on all code blocks
- npm/yarn/pnpm tabs for install commands
- Mobile responsive
- Keyboard navigation
- Search functionality

---

## IMPLEMENTATION CHECKLIST

Before starting implementation:
- [ ] Create SPECIFICATION.md with complete package spec
- [ ] Create IMPLEMENTATION.md with architecture design
- [ ] Create TASKS.md with ordered task list

During implementation:
- [ ] Implement kernel first (foundation)
- [ ] Implement plugins one by one
- [ ] Implement React integration
- [ ] Build Dashboard UI last (depends on everything)
- [ ] Maintain 100% test coverage throughout
- [ ] Write JSDoc for all public APIs
- [ ] Create examples for each feature

Before completion:
- [ ] All tests passing (100% success)
- [ ] Coverage report shows 100%
- [ ] README.md complete with all sections
- [ ] CHANGELOG.md initialized
- [ ] Website functional
- [ ] Package builds without errors
- [ ] Tree-shaking works correctly
- [ ] Production build has zero overhead when disabled

---

## CRITICAL IMPLEMENTATION NOTES

### Performance is Everything
This is a profiler - it MUST NOT slow down the app it's profiling:
- Use `requestIdleCallback` for non-critical updates
- Batch metric updates
- Throttle Dashboard re-renders
- Sample rate option for high-frequency renders
- Lazy initialize plugins

### Tree-Shaking
Package must be fully tree-shakeable:
- No side effects in module scope
- Use named exports
- Mark package.json with `"sideEffects": false`
- Dashboard and individual plugins should be separate entry points

### React Compatibility
- Test with React 17, 18, and 19 (beta)
- Handle StrictMode double-renders
- Support Concurrent Mode
- Handle Suspense boundaries
- Work with React.memo, forwardRef, lazy

### Shadow DOM Dashboard
The dashboard MUST render in Shadow DOM:
- Complete CSS isolation
- No style leakage in/out
- Handle event propagation correctly
- Support keyboard shortcuts from shadow root

---

## BEGIN IMPLEMENTATION

Start by creating SPECIFICATION.md with the complete package specification based on the features and architecture above. Then proceed with IMPLEMENTATION.md and TASKS.md before writing any actual code.

Remember: This package will be published to NPM. It must be production-ready, zero-dependency, fully tested, and professionally documented.

The micro-kernel architecture is the foundation - get it right first, everything else builds on it.