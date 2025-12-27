# ReactScope

**Zero-dependency React performance profiler with micro-kernel plugin architecture.**

[![npm version](https://img.shields.io/npm/v/@oxog/reactscope.svg)](https://www.npmjs.com/package/@oxog/reactscope)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Track renders, detect wasted updates, monitor memory, and optimize your React applications with a powerful micro-kernel plugin architecture.

## Features

- **Zero Dependencies** - No runtime dependencies, everything implemented from scratch
- **Render Tracking** - Track every render with precise timing and phase detection
- **Wasted Render Detection** - Automatically detect unnecessary re-renders
- **Props Diffing** - Deep comparison of props between renders
- **Memory Monitoring** - Track heap usage and detect potential memory leaks
- **Network Correlation** - Correlate network requests with component renders
- **Visual Dashboard** - Real-time monitoring with Shadow DOM isolation
- **Plugin Architecture** - Extensible micro-kernel design
- **TypeScript First** - Full type safety with strict mode
- **Tree Shakeable** - Only include what you use

## Installation

```bash
npm install @oxog/reactscope
```

```bash
yarn add @oxog/reactscope
```

```bash
pnpm add @oxog/reactscope
```

## Quick Start

### 1. Wrap your app with the Provider

```tsx
import { ReactScopeProvider } from '@oxog/reactscope'

function App() {
  return (
    <ReactScopeProvider>
      <YourApp />
    </ReactScopeProvider>
  )
}
```

### 2. Use the useScope hook to track components

```tsx
import { useScope } from '@oxog/reactscope'

function MyComponent({ data }) {
  const scope = useScope('MyComponent')

  // Access metrics
  console.log('Renders:', scope.renderCount)
  console.log('Avg time:', scope.averageRenderTime)

  return <div>{data}</div>
}
```

### 3. Or wrap components with the Scope component

```tsx
import { Scope } from '@oxog/reactscope'

function App() {
  return (
    <Scope name="ExpensiveList">
      <ExpensiveList items={items} />
    </Scope>
  )
}
```

### 4. Enable the Dashboard

```tsx
import { ReactScopeProvider, createDashboardUIPlugin } from '@oxog/reactscope'

function App() {
  return (
    <ReactScopeProvider
      plugins={[createDashboardUIPlugin()]}
      onReady={(kernel) => {
        // Open with Ctrl+Shift+R or programmatically
        kernel.getPlugin('dashboard-ui')?.api.show()
      }}
    >
      <YourApp />
    </ReactScopeProvider>
  )
}
```

## API Reference

### Provider

```tsx
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
  {children}
</ReactScopeProvider>
```

### Hooks

```tsx
// Main profiling hook
const scope = useScope('ComponentName', options)
scope.renderCount       // number
scope.lastRenderTime    // number (ms)
scope.averageRenderTime // number (ms)
scope.wastedRenders     // number

// Read-only metrics hook
const metrics = useScopeMetrics('ComponentId')

// Access kernel directly
const kernel = useScopeContext()
```

### HOC

```tsx
import { withScope } from '@oxog/reactscope'

const ProfiledComponent = withScope(MyComponent, {
  name: 'MyComponent',
  trackProps: true,
  onRender: (metrics) => console.log(metrics),
})
```

## Plugins

ReactScope comes with 10 built-in plugins:

| Plugin | Description |
|--------|-------------|
| `render-tracker` | Tracks render count and duration |
| `props-differ` | Analyzes props changes between renders |
| `wasted-render-detector` | Detects unnecessary re-renders |
| `lifecycle-tracker` | Tracks mount/unmount events |
| `console-reporter` | Logs profiling data to console |
| `json-exporter` | Exports metrics as JSON |
| `timeline-recorder` | Records events for playback |
| `memory-tracker` | Monitors memory usage |
| `network-correlator` | Correlates renders with network requests |
| `dashboard-ui` | Visual overlay panel |

### Creating Custom Plugins

```tsx
import { createPlugin } from '@oxog/reactscope'

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

## Programmatic API

```tsx
import { getKernel, getMetrics, exportMetrics, clearMetrics } from '@oxog/reactscope'

// Access global kernel
const kernel = getKernel()

// Get metrics store
const metrics = getMetrics()

// Export as JSON
const json = exportMetrics()

// Clear all data
clearMetrics()
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Performance

ReactScope is designed to have minimal impact on your application:

- Uses `requestIdleCallback` for non-critical updates
- Batches metric updates
- Throttles dashboard renders
- Supports sampling rate for high-frequency renders
- Lazy initializes plugins

## License

MIT

## Links

- [Documentation](https://reactscope.oxog.dev)
- [GitHub Repository](https://github.com/ersinkoc/reactscope)
