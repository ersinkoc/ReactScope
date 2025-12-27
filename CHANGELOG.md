# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

#### Core
- Micro-kernel architecture with event-driven plugin system
- Centralized metrics store with component tree management
- Type-safe event bus with pub/sub pattern
- Plugin registry with lifecycle management

#### Plugins
- **render-tracker**: Track render count, duration, and history
- **props-differ**: Deep props comparison and change tracking
- **wasted-render-detector**: Detect unnecessary re-renders
- **lifecycle-tracker**: Track mount/unmount events and component lifetime
- **console-reporter**: Configurable console logging
- **json-exporter**: Export metrics as JSON for CI/CD
- **timeline-recorder**: Record events for playback and analysis
- **memory-tracker**: Monitor memory usage (Chrome)
- **network-correlator**: Correlate renders with network requests
- **dashboard-ui**: Visual overlay panel with Shadow DOM isolation

#### React Integration
- `ReactScopeProvider` - Context provider with plugin initialization
- `useScope` - Hook for component profiling
- `useScopeMetrics` - Read-only metrics hook
- `useScopeContext` - Direct kernel access
- `Scope` - Wrapper component using React Profiler API
- `withScope` - Higher-order component for profiling

#### Dashboard Features
- Component tree visualization
- Real-time metrics display
- Wasted render warnings
- Slow render alerts
- Search and filter components
- Draggable and resizable panel
- Keyboard shortcut (Ctrl+Shift+R)
- Shadow DOM style isolation

#### Utilities
- `deepEqual` - Deep equality comparison
- `shallowEqual` - Shallow equality comparison
- `uid` - Unique ID generation
- `throttle` - Throttle function execution
- `debounce` - Debounce function execution
- Format utilities for duration, bytes, numbers, percentages

### Technical Details
- Zero runtime dependencies
- TypeScript strict mode
- ESM and CommonJS builds
- Tree-shakeable exports
- React 17+ support
- Concurrent Mode compatible

[1.0.0]: https://github.com/ersinkoc/reactscope/releases/tag/v1.0.0
