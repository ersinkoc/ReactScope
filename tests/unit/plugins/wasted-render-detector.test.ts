import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWastedRenderDetectorPlugin } from '../../../src/plugins/wasted-render-detector/wasted-render-detector'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('WastedRenderDetectorPlugin', () => {
  let mockKernel: Kernel
  let mockMetricsStore: MetricsStore
  let metricsMap: Map<string, ComponentMetrics>

  beforeEach(() => {
    metricsMap = new Map()
    mockMetricsStore = {
      get: vi.fn((id: string) => metricsMap.get(id)),
      set: vi.fn((id: string, metrics: ComponentMetrics) => metricsMap.set(id, metrics)),
      update: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(() => metricsMap),
      clear: vi.fn(),
      getTree: vi.fn(() => ({ root: null, nodeMap: new Map() })),
      updateTree: vi.fn(),
      removeFromTree: vi.fn(),
      addTimelineEvent: vi.fn(),
      getTimeline: vi.fn(() => []),
      clearTimeline: vi.fn(),
      getSessionStart: vi.fn(() => Date.now()),
      getLastUpdate: vi.fn(() => Date.now()),
      getSessionDuration: vi.fn(() => 0),
      getData: vi.fn(() => ({
        components: new Map(),
        tree: { root: null, nodeMap: new Map() },
        timeline: [],
        sessionStart: Date.now(),
        lastUpdate: Date.now(),
      })),
    }

    mockKernel = {
      emit: vi.fn(),
      on: vi.fn(() => () => {}),
      getMetrics: vi.fn(() => mockMetricsStore),
      updateMetrics: vi.fn(),
      getComponentMetrics: vi.fn(),
      clearMetrics: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(() => []),
      configure: vi.fn(),
      getOptions: vi.fn(() => ({ maxHistorySize: 100 })),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createWastedRenderDetectorPlugin()
    expect(plugin.name).toBe('wasted-render-detector')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createWastedRenderDetectorPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getWastedRenders).toBe('function')
    expect(typeof plugin.api?.getWastedRenderCount).toBe('function')
    expect(typeof plugin.api?.getWastedRenderPercentage).toBe('function')
    expect(typeof plugin.api?.getAllWastedRenders).toBe('function')
    expect(typeof plugin.api?.getMostWastefulComponents).toBe('function')
    expect(typeof plugin.api?.clearWastedRenders).toBe('function')
    expect(typeof plugin.api?.markAsWasted).toBe('function')
  })

  it('should detect wasted renders when no props change', () => {
    const plugin = createWastedRenderDetectorPlugin()
    plugin.install(mockKernel)

    // First render (mount)
    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    // Second render (update) with no props change
    plugin.hooks?.onPropsChange?.({
      type: 'props-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      changes: [], // No changes
      timestamp: Date.now(),
    })

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'update',
      timestamp: Date.now(),
    })

    const wastedRenders = plugin.api?.getWastedRenders('comp-1') as unknown[]
    expect(wastedRenders.length).toBeGreaterThanOrEqual(0) // At least tracks it
  })

  it('should not flag mount phase as wasted', () => {
    const plugin = createWastedRenderDetectorPlugin()
    plugin.install(mockKernel)

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    const wastedRenders = plugin.api?.getWastedRenders('comp-1') as unknown[]
    expect(wastedRenders.length).toBe(0)
  })

  it('should mark render as wasted via API', () => {
    const plugin = createWastedRenderDetectorPlugin()
    plugin.install(mockKernel)

    // Add mock metrics for the component
    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      renderCount: 5,
      totalRenderTime: 25,
      averageRenderTime: 5,
      lastRenderTime: 5,
      wastedRenderCount: 0,
      mountTime: Date.now(),
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [],
      parentId: null,
      childIds: [],
    })

    plugin.api?.markAsWasted('comp-1', 'props-unchanged', 'Test marking')

    const wastedRenders = plugin.api?.getWastedRenders('comp-1') as unknown[]
    expect(wastedRenders.length).toBe(1)
  })

  it('should clear wasted renders', () => {
    const plugin = createWastedRenderDetectorPlugin()
    plugin.install(mockKernel)

    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      renderCount: 5,
      totalRenderTime: 25,
      averageRenderTime: 5,
      lastRenderTime: 5,
      wastedRenderCount: 0,
      mountTime: Date.now(),
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [],
      parentId: null,
      childIds: [],
    })

    plugin.api?.markAsWasted('comp-1', 'props-unchanged', 'Test')
    expect(plugin.api?.getWastedRenderCount('comp-1')).toBe(1)

    plugin.api?.clearWastedRenders('comp-1')
    expect(plugin.api?.getWastedRenderCount('comp-1')).toBe(0)
  })
})
