# ReactScope - Implementation Guide

## Architecture Overview

ReactScope follows a micro-kernel architecture where the kernel provides minimal core functionality, and all features are implemented as plugins. This design enables:

1. **Modularity**: Each feature is self-contained
2. **Extensibility**: Users can create custom plugins
3. **Tree-shaking**: Unused plugins are excluded from bundle
4. **Testability**: Components can be tested in isolation
5. **Flexibility**: Features can be enabled/disabled at runtime

```
┌─────────────────────────────────────────────────────────────────┐
│                          Application                             │
├─────────────────────────────────────────────────────────────────┤
│                    ReactScopeProvider                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      KERNEL                              │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  EventBus  │  MetricsStore  │  PluginRegistry           │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                         PLUGINS                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │render-tracker│ │props-differ │ │wasted-render│ │ lifecycle │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │console-report│ │json-exporter│ │timeline-rec │ │memory-trk │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
│  ┌─────────────┐ ┌─────────────────────────────────────────────┐│
│  │network-corr │ │              dashboard-ui                   ││
│  └─────────────┘ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### 1. Event Bus Pattern

**Decision**: Use a simple pub/sub event bus for communication between kernel and plugins.

**Rationale**:
- Decouples plugins from each other
- Enables async event handling
- Simplifies testing with mock events
- Familiar pattern for developers

**Implementation**:
```typescript
class EventBus {
  private listeners = new Map<string, Set<Function>>()

  emit(event: KernelEvent): void {
    const handlers = this.listeners.get(event.type)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
  }

  on(type: string, handler: Function): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler)
    return () => this.off(type, handler)
  }
}
```

### 2. Centralized Metrics Store

**Decision**: All metrics are stored centrally in MetricsStore, not in individual plugins.

**Rationale**:
- Single source of truth
- Enables cross-plugin queries
- Simplifies serialization/export
- Reduces memory duplication

**Implementation**:
- Use Map for O(1) component lookups
- Maintain tree structure separately for hierarchy
- Limit timeline size with configurable max
- Use weak references where appropriate

### 3. Plugin Lifecycle

**Decision**: Plugins have explicit install/uninstall lifecycle methods.

**Rationale**:
- Clean setup and teardown
- Prevents memory leaks
- Enables hot-swapping plugins
- Clear initialization order

**Lifecycle Flow**:
```
register(plugin)
    │
    ▼
plugin.install(kernel)
    │
    ▼
Subscribe to events via kernel.on()
    │
    ▼
Plugin is active, receives events
    │
    ▼
unregister(pluginName)
    │
    ▼
plugin.uninstall()
    │
    ▼
Cleanup listeners, release resources
```

### 4. React Integration Strategy

**Decision**: Use React's built-in Profiler API as primary integration point.

**Rationale**:
- Official API, stable across versions
- Provides accurate timing
- Works with Concurrent Mode
- Minimal overhead

**Integration Points**:
1. `ReactScopeProvider` - wraps app, initializes kernel
2. `Scope` component - wraps individual components for tracking
3. `useScope` hook - programmatic tracking inside components
4. `withScope` HOC - decorator pattern for class/function components

### 5. Shadow DOM for Dashboard

**Decision**: Render dashboard inside Shadow DOM.

**Rationale**:
- Complete CSS isolation
- No conflicts with host app styles
- Consistent appearance regardless of app theme
- Can use any CSS without pollution

**Implementation**:
```typescript
function createShadowRoot(container: HTMLElement): ShadowRoot {
  const shadow = container.attachShadow({ mode: 'open' })

  // Inject styles
  const style = document.createElement('style')
  style.textContent = DASHBOARD_CSS
  shadow.appendChild(style)

  return shadow
}
```

### 6. Unique ID Generation

**Decision**: Use timestamp + random string for component IDs.

**Rationale**:
- No external dependency
- Collision-resistant for practical purposes
- Sortable by creation time
- Human-readable

**Implementation**:
```typescript
function uid(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}
```

### 7. Performance Optimizations

**Decision**: Use multiple strategies to minimize profiler overhead.

**Strategies**:

1. **Batching**: Collect events, process in batches
```typescript
class BatchProcessor {
  private queue: KernelEvent[] = []
  private scheduled = false

  add(event: KernelEvent): void {
    this.queue.push(event)
    if (!this.scheduled) {
      this.scheduled = true
      requestIdleCallback(() => this.flush())
    }
  }

  private flush(): void {
    const events = this.queue
    this.queue = []
    this.scheduled = false
    events.forEach(event => this.process(event))
  }
}
```

2. **Throttling**: Limit UI updates
```typescript
const throttledUpdate = throttle(updateDashboard, 100)
```

3. **Sampling**: Skip some events under high load
```typescript
if (Math.random() > sampleRate) return
```

4. **Lazy Initialization**: Initialize plugins on first use
```typescript
get api() {
  if (!this._api) {
    this._api = this.createAPI()
  }
  return this._api
}
```

### 8. Memory Management

**Decision**: Implement automatic cleanup with configurable limits.

**Strategies**:

1. **History Limits**: Cap stored events
```typescript
if (this.timeline.length > maxHistorySize) {
  this.timeline = this.timeline.slice(-maxHistorySize)
}
```

2. **Weak References**: For component references where possible

3. **Explicit Cleanup**: Plugins must clean up on uninstall

4. **Unmount Handling**: Remove component data after grace period

### 9. Type Safety

**Decision**: Full TypeScript strict mode with comprehensive types.

**Approach**:
- All public APIs have explicit types
- Internal functions typed for safety
- Generic types for plugin APIs
- Discriminated unions for events

```typescript
type KernelEvent =
  | { type: 'render'; payload: RenderPayload }
  | { type: 'mount'; payload: MountPayload }
  | { type: 'unmount'; payload: UnmountPayload }
  // ... discriminated union

function handleEvent<T extends KernelEvent>(event: T): void {
  switch (event.type) {
    case 'render':
      // TypeScript knows event.payload is RenderPayload
      break
  }
}
```

### 10. Browser Compatibility

**Decision**: Feature detection with graceful fallbacks.

**Implementation**:
```typescript
const hasPerformanceMemory =
  typeof performance !== 'undefined' &&
  'memory' in performance

const hasIdleCallback =
  typeof requestIdleCallback !== 'undefined'

const scheduleIdle = hasIdleCallback
  ? requestIdleCallback
  : (fn: () => void) => setTimeout(fn, 1)
```

---

## Data Structures

### ComponentMetrics
```typescript
interface ComponentMetrics {
  componentId: string
  componentName: string

  // Render tracking
  renderCount: number
  totalRenderTime: number
  averageRenderTime: number  // Computed: totalRenderTime / renderCount
  lastRenderTime: number
  renderHistory: RenderRecord[]  // Limited to maxHistorySize

  // Waste detection
  wastedRenderCount: number

  // Lifecycle
  mountTime: number | null
  unmountTime: number | null
  isCurrentlyMounted: boolean
  mountCount: number

  // Props tracking
  propsChangeCount: number

  // Tree structure
  parentId: string | null
  childIds: string[]
}
```

### RenderRecord
```typescript
interface RenderRecord {
  timestamp: number
  duration: number
  phase: 'mount' | 'update'
  wasWasted: boolean
  propsChanged: string[]  // Keys that changed
}
```

### ComponentTree
```typescript
interface ComponentTree {
  root: TreeNode | null
  nodeMap: Map<string, TreeNode>  // Fast lookup by ID
}

interface TreeNode {
  id: string
  name: string
  children: TreeNode[]
  metrics: ComponentMetrics
  depth: number
  isExpanded: boolean
}
```

---

## Error Handling

### Strategy
1. Never throw errors that could crash the host app
2. Log errors to console in development
3. Emit error events for plugin handling
4. Provide meaningful error messages

### Implementation
```typescript
function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context: string
): T {
  try {
    return fn()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ReactScope] Error in ${context}:`, error)
    }
    kernel.emit({
      type: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
      context
    })
    return fallback
  }
}
```

---

## Testing Strategy

### Unit Tests
- Test each function in isolation
- Mock dependencies
- Cover all branches
- Test error conditions

### Integration Tests
- Test plugin interactions
- Test React component integration
- Test event flow end-to-end
- Test Dashboard rendering

### Test Utilities
```typescript
// Mock kernel for testing plugins
function createMockKernel(): Kernel {
  return {
    emit: vi.fn(),
    on: vi.fn(() => vi.fn()),
    getMetrics: vi.fn(() => createMockMetricsStore()),
    // ...
  }
}

// Test component for React tests
function TestComponent({ value }: { value: number }) {
  return <div>{value}</div>
}
```

---

## Build Output

### Entry Points
- `index.js` - Main entry (ESM)
- `index.cjs` - CommonJS entry
- `index.d.ts` - TypeScript declarations

### Tree Shaking
- Mark package as side-effect-free
- Use named exports only
- Avoid global state at module level
- Lazy initialize singletons

### Bundle Size Targets
- Core kernel: < 5KB gzipped
- Each plugin: < 3KB gzipped
- Dashboard: < 15KB gzipped
- Total with all: < 30KB gzipped

---

## Future Considerations

1. **Server Components**: React Server Components compatibility
2. **React Native**: Potential mobile support
3. **DevTools Extension**: Browser extension integration
4. **Remote Monitoring**: Send metrics to external service
5. **Replay**: Full session replay from timeline
6. **Comparison**: Compare metrics between sessions
7. **Benchmarking**: Automated performance regression detection
