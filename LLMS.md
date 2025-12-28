# @oxog/reactscope - LLM Documentation

> Zero-dependency React performance profiler with micro-kernel plugin architecture

**Version:** 1.0.0
**License:** MIT
**Repository:** https://github.com/ersinkoc/reactscope
**Homepage:** https://reactscope.oxog.dev

---

## Quick Reference

### Installation

```bash
npm install @oxog/reactscope
# or
yarn add @oxog/reactscope
# or
pnpm add @oxog/reactscope
```

### Quick Start

```typescript
import { ReactScopeProvider, useScope } from '@oxog/reactscope';

// 1. Wrap your app
function App() {
  return (
    <ReactScopeProvider>
      <YourApp />
    </ReactScopeProvider>
  );
}

// 2. Profile components
function MyComponent() {
  const scope = useScope('MyComponent');
  console.log('Renders:', scope.renderCount);
  return <div>Hello</div>;
}
```

---

## Package Overview

### Purpose

ReactScope is a comprehensive React performance profiling library that helps developers identify and fix performance issues in their applications. It tracks component renders, detects wasted re-renders, monitors memory usage, and provides a visual dashboard for real-time monitoring.

### Key Features

- **Zero Dependencies** - No runtime dependencies; everything implemented from scratch
- **Render Tracking** - Track every render with precise timing and phase detection (mount/update)
- **Wasted Render Detection** - Automatically detect unnecessary re-renders where props/state haven't changed
- **Props Diffing** - Deep comparison of props between renders to identify what changed
- **Memory Monitoring** - Track heap usage and detect potential memory leaks (Chrome only)
- **Network Correlation** - Correlate network requests with component renders
- **Visual Dashboard** - Real-time monitoring overlay with Shadow DOM isolation
- **Plugin Architecture** - Extensible micro-kernel design for custom plugins
- **TypeScript First** - Full type safety with strict mode enabled
- **Tree Shakeable** - Only include what you use; individual plugin imports available

### Architecture

ReactScope uses a micro-kernel architecture with three core components:

1. **Kernel** - Central orchestrator that manages plugins, events, and metrics
2. **Event Bus** - Pub/sub system for type-safe event communication
3. **Metrics Store** - Centralized storage for component metrics and tree structure

Data flows from React components → Kernel events → Plugin hooks → Metrics store → UI/exports.

### Dependencies

- **Runtime:** Zero runtime dependencies
- **Peer:** `react >=17.0.0`, `react-dom >=17.0.0`

---

## API Reference

### Exports Summary

| Export | Type | Description |
|--------|------|-------------|
| `ReactScopeProvider` | Component | Context provider that initializes the kernel |
| `useScope` | Hook | Main hook for profiling components |
| `useScopeMetrics` | Hook | Read-only metrics for a specific component |
| `useAllScopeMetrics` | Hook | Read all component metrics |
| `useScopeSummary` | Hook | Get summary statistics |
| `useScopeContext` | Hook | Direct kernel access |
| `Scope` | Component | Wrapper component using React Profiler API |
| `withScope` | HOC | Higher-order component for profiling |
| `createPlugin` | Function | Helper to create custom plugins |
| `createKernel` | Function | Create a standalone kernel instance |
| `getKernel` | Function | Get the global kernel instance |
| `getMetrics` | Function | Get metrics from global kernel |
| `exportMetrics` | Function | Export all metrics as JSON |
| `clearMetrics` | Function | Clear all stored metrics |

### React Integration

#### `ReactScopeProvider`

The main provider component that initializes ReactScope.

```typescript
interface ReactScopeProviderProps {
  children: React.ReactNode;
  enabled?: boolean;           // Enable/disable profiling (default: true)
  plugins?: Plugin[];          // Additional plugins to register
  onReady?: (kernel: Kernel) => void;  // Callback when kernel is ready
  options?: KernelOptions;     // Kernel configuration
}

interface KernelOptions {
  enabled?: boolean;           // Enable/disable (default: true)
  trackAllComponents?: boolean; // Auto-track all components (default: false)
  sampleRate?: number;         // 0-1, for sampling high-frequency renders (default: 1)
  maxHistorySize?: number;     // Limit stored events (default: 1000)
}
```

**Example:**

```tsx
import { ReactScopeProvider, createDashboardUIPlugin } from '@oxog/reactscope';

function App() {
  return (
    <ReactScopeProvider
      enabled={process.env.NODE_ENV === 'development'}
      plugins={[createDashboardUIPlugin()]}
      onReady={(kernel) => {
        console.log('ReactScope ready!');
        // Open dashboard programmatically
        kernel.getPlugin('dashboard-ui')?.api.show();
      }}
      options={{
        sampleRate: 0.5,      // Sample 50% of renders
        maxHistorySize: 500,  // Keep last 500 events
      }}
    >
      <YourApp />
    </ReactScopeProvider>
  );
}
```

---

### Hooks

#### `useScope(name, options?)`

Main hook for profiling a component. Tracks renders and provides metrics.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Component name for identification |
| `options` | `UseScopeOptions` | No | `{}` | Configuration options |

```typescript
interface UseScopeOptions {
  trackProps?: boolean;        // Track props changes
  trackState?: boolean;        // Track state changes
  onRender?: (metrics: ComponentMetrics) => void;  // Callback on each render
}
```

**Returns:** `ScopeHandle`

```typescript
interface ScopeHandle {
  readonly componentId: string;      // Unique component ID
  readonly renderCount: number;      // Total render count
  readonly lastRenderTime: number;   // Last render duration (ms)
  readonly averageRenderTime: number; // Average render duration (ms)
  readonly wastedRenders: number;    // Count of wasted renders
  readonly isTracking: boolean;      // Whether tracking is active
  trackRender(duration: number, phase: 'mount' | 'update'): void;
  trackPropsChange(changes: PropsDiff[]): void;
}
```

**Example:**

```tsx
function ExpensiveList({ items }) {
  const scope = useScope('ExpensiveList', {
    trackProps: true,
    onRender: (metrics) => {
      if (metrics.averageRenderTime > 16) {
        console.warn('Slow component detected!');
      }
    }
  });

  return (
    <div>
      <p>Renders: {scope.renderCount}</p>
      <p>Avg time: {scope.averageRenderTime.toFixed(2)}ms</p>
      <p>Wasted: {scope.wastedRenders}</p>
      {items.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}
```

---

#### `useScopeMetrics(componentId)`

Read-only hook to get metrics for a specific component by ID.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `componentId` | `string` | Yes | The component's unique ID |

**Returns:** `ComponentMetrics | undefined`

```typescript
interface ComponentMetrics {
  componentId: string;
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  wastedRenderCount: number;
  mountTime: number | null;
  unmountTime: number | null;
  isCurrentlyMounted: boolean;
  mountCount: number;
  propsChangeCount: number;
  renderHistory: RenderRecord[];
  parentId: string | null;
  childIds: string[];
}
```

---

#### `useAllScopeMetrics()`

Get all component metrics as a Map.

**Returns:** `Map<string, ComponentMetrics>`

**Example:**

```tsx
function PerformanceMonitor() {
  const allMetrics = useAllScopeMetrics();

  const sortedByRenders = Array.from(allMetrics.values())
    .sort((a, b) => b.renderCount - a.renderCount);

  return (
    <table>
      {sortedByRenders.map(m => (
        <tr key={m.componentId}>
          <td>{m.componentName}</td>
          <td>{m.renderCount}</td>
          <td>{m.averageRenderTime.toFixed(2)}ms</td>
        </tr>
      ))}
    </table>
  );
}
```

---

#### `useScopeSummary()`

Get aggregated summary statistics across all tracked components.

**Returns:**

```typescript
{
  totalComponents: number;      // Count of tracked components
  totalRenders: number;         // Sum of all renders
  totalWastedRenders: number;   // Sum of all wasted renders
  averageRenderTime: number;    // Global average render time
}
```

---

#### `useScopeContext()`

Get direct access to the kernel instance.

**Returns:** `Kernel`

**Example:**

```tsx
function DebugPanel() {
  const kernel = useScopeContext();

  const exportData = () => {
    const jsonPlugin = kernel.getPlugin('json-exporter');
    const data = jsonPlugin?.api.exportAll();
    console.log(data);
  };

  return <button onClick={exportData}>Export Metrics</button>;
}
```

---

### Components

#### `Scope`

Wrapper component that uses React's Profiler API to track children.

```typescript
interface ScopeProps {
  children: React.ReactNode;
  name?: string;                // Component name (default: 'Scope')
  onRender?: (metrics: ComponentMetrics) => void;
  trackProps?: boolean;         // Track props changes
  trackState?: boolean;         // Track state changes
}
```

**Example:**

```tsx
import { Scope } from '@oxog/reactscope';

function App() {
  return (
    <Scope name="ExpensiveSection">
      <HeavyDataGrid data={largeDataset} />
    </Scope>
  );
}
```

---

### Higher-Order Component

#### `withScope(Component, options?)`

HOC that wraps a component with profiling capabilities.

```typescript
interface WithScopeOptions {
  name?: string;           // Override component name
  trackProps?: boolean;    // Track props changes
  trackState?: boolean;    // Track state changes
  onRender?: (metrics: ComponentMetrics) => void;
}
```

**Example:**

```tsx
import { withScope } from '@oxog/reactscope';

const ProfiledButton = withScope(Button, {
  name: 'Button',
  trackProps: true,
  onRender: (metrics) => console.log('Button rendered:', metrics.renderCount)
});

// Use like normal component
<ProfiledButton onClick={handleClick}>Click me</ProfiledButton>
```

---

## Plugins

ReactScope includes 10 built-in plugins. Core plugins are registered automatically; others must be added manually.

### Core Plugins (Auto-registered)

| Plugin | Name | Description |
|--------|------|-------------|
| `RenderTrackerPlugin` | `render-tracker` | Tracks render count and duration |
| `PropsDifferPlugin` | `props-differ` | Analyzes props changes between renders |
| `WastedRenderDetectorPlugin` | `wasted-render-detector` | Detects unnecessary re-renders |
| `LifecycleTrackerPlugin` | `lifecycle-tracker` | Tracks mount/unmount events |

### Optional Plugins (Manual registration)

| Plugin | Name | Description |
|--------|------|-------------|
| `DashboardUIPlugin` | `dashboard-ui` | Visual overlay panel |
| `ConsoleReporterPlugin` | `console-reporter` | Logs to browser console |
| `JSONExporterPlugin` | `json-exporter` | Exports metrics as JSON |
| `TimelineRecorderPlugin` | `timeline-recorder` | Records events for playback |
| `MemoryTrackerPlugin` | `memory-tracker` | Monitors memory usage |
| `NetworkCorrelatorPlugin` | `network-correlator` | Correlates renders with network requests |

---

### Plugin: dashboard-ui

Visual overlay panel with component tree and metrics.

```typescript
import { createDashboardUIPlugin } from '@oxog/reactscope';
// Or tree-shake import:
import { createDashboardUIPlugin } from '@oxog/reactscope/plugins/dashboard-ui';

interface DashboardOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  shortcut?: string;           // Keyboard shortcut (default: 'ctrl+shift+r')
  draggable?: boolean;         // Enable dragging (default: true)
  resizable?: boolean;         // Enable resizing (default: true)
  defaultWidth?: number;       // Initial width (default: 400)
  defaultHeight?: number;      // Initial height (default: 500)
  defaultCollapsed?: boolean;  // Start collapsed (default: false)
  theme?: 'dark' | 'light' | 'auto';
}

interface DashboardUIAPI {
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
  setPosition(position: DashboardPosition): void;
  setTheme(theme: DashboardTheme): void;
  expand(): void;
  collapse(): void;
  isCollapsed(): boolean;
  focusSearch(): void;
  selectComponent(componentId: string): void;
  refresh(): void;
}
```

**Example:**

```tsx
<ReactScopeProvider
  plugins={[
    createDashboardUIPlugin({
      position: 'bottom-right',
      shortcut: 'ctrl+shift+d',
      theme: 'dark',
    })
  ]}
  onReady={(kernel) => {
    // Show dashboard on load
    kernel.getPlugin('dashboard-ui')?.api.show();
  }}
>
  <App />
</ReactScopeProvider>
```

---

### Plugin: render-tracker

Tracks render statistics for each component.

```typescript
import { createRenderTrackerPlugin } from '@oxog/reactscope';

interface RenderTrackerAPI {
  getRenderCount(componentId: string): number;
  getAverageRenderTime(componentId: string): number;
  getTotalRenderTime(componentId: string): number;
  getLastRenderTime(componentId: string): number;
  getRenderHistory(componentId: string): RenderRecord[];
  getSlowRenders(threshold?: number): RenderRecord[];  // default threshold: 16ms
  getRendersByTimeRange(start: number, end: number): RenderRecord[];
  getAllRenderCounts(): Map<string, number>;
}

interface RenderRecord {
  timestamp: number;
  duration: number;
  phase: 'mount' | 'update';
  wasWasted: boolean;
  propsChanged: string[];
}
```

---

### Plugin: props-differ

Analyzes props changes between renders.

```typescript
import { createPropsDifferPlugin } from '@oxog/reactscope';

interface PropsDifferAPI {
  getPropsHistory(componentId: string): PropsSnapshot[];
  getLastChange(componentId: string): PropsDiff[] | null;
  getChangeFrequency(componentId: string, propKey: string): number;
  getMostChangedProps(componentId: string, limit?: number): PropChangeStats[];
  compareProps(prev: unknown, next: unknown): PropsDiff[];
  clearHistory(componentId?: string): void;
}

interface PropsDiff {
  key: string;
  prev: unknown;
  next: unknown;
  isDeepEqual: boolean;  // true if values are deep equal despite reference change
}
```

---

### Plugin: wasted-render-detector

Detects renders where props/state didn't actually change.

```typescript
import { createWastedRenderDetectorPlugin } from '@oxog/reactscope';

interface WastedRenderDetectorAPI {
  getWastedRenders(componentId: string): WastedRender[];
  getWastedRenderCount(componentId: string): number;
  getWastedRenderPercentage(componentId: string): number;
  getAllWastedRenders(): Map<string, WastedRender[]>;
  getMostWastefulComponents(limit?: number): WastedRenderStats[];
  clearWastedRenders(componentId?: string): void;
  markAsWasted(componentId: string, reason: WastedRenderReason, details?: string): void;
}

type WastedRenderReason = 'props-unchanged' | 'state-unchanged' | 'context-unchanged';

interface WastedRender {
  timestamp: number;
  reason: WastedRenderReason;
  details: string;
  componentId: string;
  componentName: string;
}
```

---

### Plugin: lifecycle-tracker

Tracks component mount/unmount lifecycle.

```typescript
import { createLifecycleTrackerPlugin } from '@oxog/reactscope';

interface LifecycleTrackerAPI {
  getMountTime(componentId: string): number | null;
  getUnmountTime(componentId: string): number | null;
  getLifetime(componentId: string): number | null;  // Duration in ms
  getMountCount(componentId: string): number;
  isCurrentlyMounted(componentId: string): boolean;
  getLifecycleHistory(componentId: string): LifecycleEvent[];
  getMountedComponents(): string[];
  getAverageLifetime(componentId: string): number;
  getAllMountCounts(): Map<string, number>;
}
```

---

### Plugin: console-reporter

Logs profiling data to browser console.

```typescript
import { createConsoleReporterPlugin } from '@oxog/reactscope';

interface ConsoleReporterOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  groupByComponent?: boolean;
  includeTimestamp?: boolean;
  formatOutput?: boolean;
  filter?: (event: KernelEvent) => boolean;
}

interface ConsoleReporterAPI {
  setLogLevel(level: LogLevel): void;
  getLogLevel(): LogLevel;
  setFilter(filter: ((event: KernelEvent) => boolean) | null): void;
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  log(message: string, level?: LogLevel): void;
}
```

**Example:**

```tsx
<ReactScopeProvider
  plugins={[
    createConsoleReporterPlugin({
      logLevel: 'warn',  // Only log warnings and errors
      groupByComponent: true,
      filter: (event) => event.type === 'render' && event.duration > 16
    })
  ]}
>
  <App />
</ReactScopeProvider>
```

---

### Plugin: json-exporter

Exports metrics as JSON for CI/CD integration.

```typescript
import { createJSONExporterPlugin } from '@oxog/reactscope';

interface JSONExporterAPI {
  exportAll(): string;                    // Full JSON export
  exportComponent(componentId: string): string;
  exportSummary(): ExportSummary;
  downloadJSON(filename?: string): void;  // Triggers browser download
  getSerializableMetrics(): SerializableMetrics;
  exportToClipboard(): Promise<void>;
}

interface ExportSummary {
  totalComponents: number;
  totalRenders: number;
  totalWastedRenders: number;
  averageRenderTime: number;
  slowestComponents: ComponentSummary[];
  mostWastedComponents: ComponentSummary[];
  timestamp: string;
  duration: number;
}
```

---

### Plugin: timeline-recorder

Records events for playback and analysis.

```typescript
import { createTimelineRecorderPlugin } from '@oxog/reactscope';

interface TimelineRecorderAPI {
  startRecording(): void;
  stopRecording(): void;
  isRecording(): boolean;
  getRecording(): TimelineRecording;
  clearRecording(): void;
  exportRecording(): string;
  getTimeRange(): { start: number; end: number };
  getEventsByType(type: string): TimestampedEvent[];
  seekTo(timestamp: number): TimestampedEvent[];
  getEventCount(): number;
}

interface TimelineRecording {
  events: TimestampedEvent[];
  startTime: number;
  endTime: number | null;
  metadata: {
    componentCount: number;
    eventCount: number;
    duration: number;
  };
}
```

---

### Plugin: memory-tracker

Monitors memory usage patterns (Chrome only).

```typescript
import { createMemoryTrackerPlugin } from '@oxog/reactscope';

interface MemoryTrackerAPI {
  getCurrentMemory(): MemorySnapshot | null;
  getMemoryHistory(): MemorySnapshot[];
  getMemoryTrend(): 'increasing' | 'stable' | 'decreasing';
  detectPotentialLeaks(): PotentialLeak[];
  startMonitoring(intervalMs?: number): void;  // default: 1000ms
  stopMonitoring(): void;
  isMonitoring(): boolean;
  getMemoryStats(): MemoryStats;
  clearHistory(): void;
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PotentialLeak {
  componentId: string;
  componentName: string;
  reason: string;
  evidence: string;
}
```

---

### Plugin: network-correlator

Correlates renders with network requests.

```typescript
import { createNetworkCorrelatorPlugin } from '@oxog/reactscope';

interface NetworkCorrelatorAPI {
  getRequestsForComponent(componentId: string): NetworkRequest[];
  getRendersForRequest(requestId: string): RenderEvent[];
  getCorrelations(): Correlation[];
  startCapturing(): void;
  stopCapturing(): void;
  isCapturing(): boolean;
  getRequestStats(): RequestStats;
  clearRequests(): void;
  getAllRequests(): NetworkRequest[];
}

interface Correlation {
  request: NetworkRequest;
  renders: RenderEvent[];
  timeGap: number;  // ms between request completion and render
}
```

---

## Creating Custom Plugins

Use `createPlugin` helper to create custom plugins:

```typescript
import { createPlugin, type Plugin, type Kernel } from '@oxog/reactscope';

const myPlugin: Plugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',

  // Optional: Called when plugin is installed
  install: (kernel: Kernel) => {
    console.log('Plugin installed!');
  },

  // Optional: Called when plugin is uninstalled
  uninstall: () => {
    console.log('Plugin uninstalled!');
  },

  // Event hooks
  hooks: {
    onRender: (event) => {
      console.log(`${event.componentName} rendered in ${event.duration}ms`);
    },
    onMount: (event) => {
      console.log(`${event.componentName} mounted`);
    },
    onUnmount: (event) => {
      console.log(`${event.componentName} unmounted`);
    },
    onPropsChange: (event) => {
      console.log(`${event.componentName} props changed:`, event.changes);
    },
    onStateChange: (event) => {
      console.log(`${event.componentName} state changed`);
    },
    onMetricsUpdate: (event) => {
      console.log(`Metrics updated for ${event.componentId}`);
    },
    onError: (event) => {
      console.error('Error:', event.error);
    },
  },

  // Public API exposed via kernel.getPlugin('my-plugin')?.api
  api: {
    customMethod: () => 'custom data',
    getStats: () => ({ /* ... */ }),
  },
});
```

**Full Custom Plugin Example:**

```typescript
import { createPlugin, type Plugin } from '@oxog/reactscope';

interface SlowRenderAlert {
  componentName: string;
  duration: number;
  timestamp: number;
}

export function createSlowRenderAlertPlugin(threshold = 16): Plugin {
  const alerts: SlowRenderAlert[] = [];

  return createPlugin({
    name: 'slow-render-alert',
    version: '1.0.0',

    hooks: {
      onRender: (event) => {
        if (event.duration > threshold) {
          alerts.push({
            componentName: event.componentName,
            duration: event.duration,
            timestamp: event.timestamp,
          });
          console.warn(
            `[SlowRender] ${event.componentName}: ${event.duration.toFixed(2)}ms`
          );
        }
      },
    },

    api: {
      getAlerts: () => [...alerts],
      clearAlerts: () => { alerts.length = 0; },
      setThreshold: (newThreshold: number) => { threshold = newThreshold; },
    },
  });
}

// Usage
<ReactScopeProvider plugins={[createSlowRenderAlertPlugin(20)]}>
  <App />
</ReactScopeProvider>
```

---

## Types & Interfaces

### Core Types

```typescript
// Component metrics stored for each tracked component
interface ComponentMetrics {
  componentId: string;
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  wastedRenderCount: number;
  mountTime: number | null;
  unmountTime: number | null;
  isCurrentlyMounted: boolean;
  mountCount: number;
  propsChangeCount: number;
  renderHistory: RenderRecord[];
  parentId: string | null;
  childIds: string[];
}

// Individual render record
interface RenderRecord {
  timestamp: number;
  duration: number;
  phase: 'mount' | 'update';
  wasWasted: boolean;
  propsChanged: string[];
}
```

### Event Types

```typescript
type KernelEventType =
  | 'render'
  | 'mount'
  | 'unmount'
  | 'props-change'
  | 'state-change'
  | 'metrics-update'
  | 'error';

interface RenderEvent {
  type: 'render';
  timestamp: number;
  componentId: string;
  componentName: string;
  duration: number;
  phase: 'mount' | 'update';
}

interface MountEvent {
  type: 'mount';
  timestamp: number;
  componentId: string;
  componentName: string;
  parentId: string | null;
}

interface UnmountEvent {
  type: 'unmount';
  timestamp: number;
  componentId: string;
  componentName: string;
}

interface PropsChangeEvent {
  type: 'props-change';
  timestamp: number;
  componentId: string;
  componentName: string;
  changes: PropsDiff[];
}
```

### Plugin Types

```typescript
interface Plugin {
  readonly name: string;
  readonly version: string;
  install(kernel: Kernel): void;
  uninstall(): void;
  hooks?: PluginHooks;
  api?: Record<string, unknown>;
}

interface PluginHooks {
  onRender?(event: RenderEvent): void;
  onMount?(event: MountEvent): void;
  onUnmount?(event: UnmountEvent): void;
  onPropsChange?(event: PropsChangeEvent): void;
  onStateChange?(event: StateChangeEvent): void;
  onMetricsUpdate?(event: MetricsUpdateEvent): void;
  onError?(event: ErrorEvent): void;
}
```

### Kernel Interface

```typescript
interface Kernel {
  // Plugin management
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  getPlugin<T extends Plugin>(name: string): T | undefined;
  getPlugins(): Plugin[];

  // Event system
  emit(event: KernelEvent): void;
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void;  // Returns unsubscribe function

  // Metrics
  getMetrics(): MetricsStore;
  updateMetrics(componentId: string, partial: Partial<ComponentMetrics>): void;
  getComponentMetrics(componentId: string): ComponentMetrics | undefined;
  clearMetrics(): void;

  // Configuration
  configure(options: KernelOptions): void;
  getOptions(): KernelOptions;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;

  // Lifecycle
  destroy(): void;
}
```

---

## Usage Patterns

### Pattern 1: Development-Only Profiling

**Use Case:** Enable profiling only in development builds

```typescript
import { ReactScopeProvider, createDashboardUIPlugin } from '@oxog/reactscope';

const isDev = process.env.NODE_ENV === 'development';

function App() {
  return (
    <ReactScopeProvider
      enabled={isDev}
      plugins={isDev ? [createDashboardUIPlugin()] : []}
    >
      <YourApp />
    </ReactScopeProvider>
  );
}
```

### Pattern 2: Selective Component Profiling

**Use Case:** Only profile specific components that matter

```typescript
function CriticalComponent({ data }) {
  // Only profile this component
  const scope = useScope('CriticalComponent');

  useEffect(() => {
    if (scope.averageRenderTime > 16) {
      // Report to analytics
      analytics.track('slow_component', {
        name: 'CriticalComponent',
        avgTime: scope.averageRenderTime,
      });
    }
  }, [scope.averageRenderTime]);

  return <ExpensiveVisualization data={data} />;
}
```

### Pattern 3: Performance Testing Integration

**Use Case:** Export metrics for CI/CD performance budgets

```typescript
import { getKernel, exportMetrics } from '@oxog/reactscope';

// In your test setup
afterAll(() => {
  const metrics = exportMetrics();
  const data = JSON.parse(metrics);

  // Assert performance budgets
  for (const component of data.components) {
    expect(component.metrics.averageRenderTime).toBeLessThan(16);
    expect(component.metrics.wastedRenderCount).toBe(0);
  }
});
```

### Pattern 4: Real-time Performance Monitoring

**Use Case:** Show performance stats in a dev toolbar

```typescript
function DevToolbar() {
  const summary = useScopeSummary();
  const kernel = useScopeContext();

  const wastedPercent = summary.totalRenders > 0
    ? ((summary.totalWastedRenders / summary.totalRenders) * 100).toFixed(1)
    : '0';

  return (
    <div className="dev-toolbar">
      <span>Components: {summary.totalComponents}</span>
      <span>Renders: {summary.totalRenders}</span>
      <span className={summary.averageRenderTime > 16 ? 'warning' : ''}>
        Avg: {summary.averageRenderTime.toFixed(2)}ms
      </span>
      <span className={parseInt(wastedPercent) > 10 ? 'warning' : ''}>
        Wasted: {wastedPercent}%
      </span>
      <button onClick={() => kernel.getPlugin('dashboard-ui')?.api.toggle()}>
        Dashboard
      </button>
    </div>
  );
}
```

### Pattern 5: Memory Leak Detection

**Use Case:** Monitor for memory leaks during development

```typescript
import {
  ReactScopeProvider,
  createMemoryTrackerPlugin,
  createDashboardUIPlugin
} from '@oxog/reactscope';

function App() {
  return (
    <ReactScopeProvider
      plugins={[
        createMemoryTrackerPlugin(),
        createDashboardUIPlugin(),
      ]}
      onReady={(kernel) => {
        // Start memory monitoring
        const memoryPlugin = kernel.getPlugin('memory-tracker');
        memoryPlugin?.api.startMonitoring(2000); // Check every 2 seconds

        // Check for leaks periodically
        setInterval(() => {
          const leaks = memoryPlugin?.api.detectPotentialLeaks();
          if (leaks?.length > 0) {
            console.warn('Potential memory leaks detected:', leaks);
          }
        }, 30000);
      }}
    >
      <YourApp />
    </ReactScopeProvider>
  );
}
```

---

## Utilities

ReactScope exports utility functions for plugin development:

```typescript
import {
  // Equality comparisons
  deepEqual,      // Deep equality check for objects/arrays
  shallowEqual,   // Shallow equality check

  // ID generation
  uid,            // Generate unique ID
  createIdGenerator, // Create custom ID generator

  // Rate limiting
  throttle,       // Throttle function execution
  debounce,       // Debounce function execution

  // Formatting
  formatDuration,    // Format milliseconds (e.g., "12.34ms")
  formatBytes,       // Format bytes (e.g., "1.5 MB")
  formatNumber,      // Format numbers with separators
  formatPercentage,  // Format as percentage
  formatTimestamp,   // Format timestamp
  formatRelativeTime, // Format relative time (e.g., "2s ago")
} from '@oxog/reactscope';
```

---

## Error Reference

### Error Types

```typescript
class ScopeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ScopeError';
  }
}
```

### Common Issues & Solutions

#### Issue: Components not being tracked

**Symptoms:**
- `useScope` returns 0 for all metrics
- Dashboard shows no components

**Cause:** ReactScopeProvider not in component tree or disabled

**Solution:**
```tsx
// Ensure provider wraps your app
<ReactScopeProvider enabled={true}>
  <App />
</ReactScopeProvider>

// Inside components, verify kernel exists
const kernel = useScopeContext();
console.log('Kernel enabled:', kernel.isEnabled());
```

#### Issue: Memory tracking not working

**Symptoms:**
- `getCurrentMemory()` returns `null`
- Console warning about Memory API

**Cause:** `performance.memory` is only available in Chrome

**Solution:**
```typescript
const memoryPlugin = kernel.getPlugin('memory-tracker');
if (memoryPlugin?.api.getCurrentMemory() === null) {
  console.log('Memory API not available - use Chrome for memory tracking');
}
```

#### Issue: Dashboard not appearing

**Symptoms:**
- Keyboard shortcut doesn't work
- `show()` has no effect

**Cause:** Dashboard plugin not registered

**Solution:**
```tsx
import { createDashboardUIPlugin } from '@oxog/reactscope';

<ReactScopeProvider
  plugins={[createDashboardUIPlugin()]}  // Must add explicitly!
>
  <App />
</ReactScopeProvider>
```

---

## Performance Considerations

### Bundle Size

- **Full package:** ~15KB (minified)
- **Gzipped:** ~5KB
- **Tree-shakeable:** Yes - import only what you need

### Tree-Shaking Individual Plugins

```typescript
// Instead of importing everything:
import { createDashboardUIPlugin } from '@oxog/reactscope';

// Import directly for smaller bundles:
import { createDashboardUIPlugin } from '@oxog/reactscope/plugins/dashboard-ui';
import { createMemoryTrackerPlugin } from '@oxog/reactscope/plugins/memory-tracker';
```

### Optimization Tips

1. **Use sampling for high-frequency components:**
```tsx
<ReactScopeProvider options={{ sampleRate: 0.1 }}>
  {/* Only 10% of renders are tracked */}
</ReactScopeProvider>
```

2. **Limit history size in production:**
```tsx
<ReactScopeProvider options={{ maxHistorySize: 100 }}>
```

3. **Disable in production builds:**
```tsx
<ReactScopeProvider enabled={process.env.NODE_ENV === 'development'}>
```

4. **Use requestIdleCallback internally:** ReactScope uses `requestIdleCallback` for non-critical updates to minimize performance impact.

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

**Note:** Memory tracking (`memory-tracker` plugin) requires Chrome, as `performance.memory` is a Chrome-only API.

---

## Comparison with Alternatives

| Feature | ReactScope | React DevTools | why-did-you-render |
|---------|------------|----------------|-------------------|
| Zero dependencies | Yes | No | No |
| Runtime profiling | Yes | DevTools only | Yes |
| Wasted render detection | Yes | No | Yes |
| Visual dashboard | Yes | DevTools tab | Console only |
| Memory tracking | Yes | No | No |
| Network correlation | Yes | No | No |
| Plugin system | Yes | No | No |
| CI/CD export | Yes | No | No |
| Bundle size | ~5KB | N/A | ~3KB |

---

## FAQ

### Q: Does ReactScope work with React Server Components?

**A:** ReactScope is designed for client-side components. Server Components don't re-render on the client, so there's nothing to track. However, Client Components within a Server Component tree work normally.

### Q: Can I use ReactScope in production?

**A:** Yes, but it's recommended to disable or use sampling in production to minimize overhead:
```tsx
<ReactScopeProvider
  enabled={process.env.NODE_ENV === 'development'}
  options={{ sampleRate: 0.01 }}  // Sample 1% if enabled
>
```

### Q: How does ReactScope handle React.StrictMode?

**A:** ReactScope handles StrictMode's double-mounting behavior correctly. The kernel is created once and persists through remounts.

### Q: Can I track components in lazy-loaded chunks?

**A:** Yes, as long as the `ReactScopeProvider` wraps the component tree. Lazy-loaded components will be tracked when they mount.

### Q: How do I reset all metrics?

**A:**
```typescript
import { clearMetrics } from '@oxog/reactscope';
clearMetrics();

// Or via kernel
const kernel = useScopeContext();
kernel.clearMetrics();
```

---

## Glossary

| Term | Definition |
|------|------------|
| Kernel | Central orchestrator managing plugins, events, and metrics |
| Plugin | Modular extension that hooks into kernel events |
| Wasted Render | A render where props/state didn't actually change |
| Scope | A profiled component or region |
| Metrics Store | Centralized storage for all component metrics |
| Event Bus | Pub/sub system for kernel events |

---

## Changelog (Recent)

### v1.0.0 (2024-01-15)

- Initial release
- Micro-kernel architecture with event-driven plugin system
- 10 built-in plugins (render-tracker, props-differ, wasted-render-detector, lifecycle-tracker, console-reporter, json-exporter, timeline-recorder, memory-tracker, network-correlator, dashboard-ui)
- React integration (Provider, hooks, HOC, Scope component)
- Visual dashboard with Shadow DOM isolation
- Zero runtime dependencies
- Full TypeScript support
- Tree-shakeable exports

---

## Links

- **NPM:** https://www.npmjs.com/package/@oxog/reactscope
- **GitHub:** https://github.com/ersinkoc/reactscope
- **Documentation:** https://reactscope.oxog.dev
- **Issues:** https://github.com/ersinkoc/reactscope/issues
- **Changelog:** https://github.com/ersinkoc/reactscope/blob/main/CHANGELOG.md

---

## LLM Usage Notes

### Recommended Prompts

When helping users with this package, consider:

1. "Help me set up ReactScope in my React app"
2. "How do I track performance of a specific component?"
3. "Debug this slow render issue using ReactScope"
4. "Create a custom plugin for ReactScope"
5. "Export ReactScope metrics for CI/CD"
6. "Detect memory leaks with ReactScope"

### Common Misconceptions

1. **Misconception:** ReactScope requires React DevTools
   **Reality:** ReactScope is completely standalone; it provides its own dashboard and doesn't need React DevTools.

2. **Misconception:** All plugins are auto-registered
   **Reality:** Only 4 core plugins are auto-registered. Dashboard, console-reporter, and others must be added manually.

3. **Misconception:** Memory tracking works in all browsers
   **Reality:** Memory tracking requires Chrome's `performance.memory` API.

### Code Generation Guidelines

When generating code for this package:

- Always import types separately with `import type { ... }`
- Use the latest API patterns (v1.0.0)
- Include error handling for async operations
- Follow the configuration patterns shown in examples
- Use tree-shakeable imports for production code
- Always wrap components with `ReactScopeProvider` at the app root
- Prefer `useScope` hook over `withScope` HOC for new code

---

## Document Metadata

- **Generated:** 2024-01-15
- **Package Version:** 1.0.0
- **Documentation Version:** 1.0
- **Format:** LLM-Optimized Markdown
- **Estimated Tokens:** ~8,000
