import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRenderTrackerPlugin } from '../../../src/plugins/render-tracker/render-tracker'
import type { Kernel, MetricsStore, ComponentMetrics, RenderRecord } from '../../../src/types'

describe('RenderTrackerPlugin', () => {
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
      updateMetrics: vi.fn((id: string, partial: Partial<ComponentMetrics>) => {
        const existing = metricsMap.get(id) || {
          componentId: id,
          componentName: '',
          renderCount: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          lastRenderTime: 0,
          wastedRenderCount: 0,
          mountTime: null,
          unmountTime: null,
          isCurrentlyMounted: false,
          mountCount: 0,
          propsChangeCount: 0,
          renderHistory: [],
          parentId: null,
          childIds: [],
        }
        metricsMap.set(id, { ...existing, ...partial })
      }),
      getComponentMetrics: vi.fn(),
      clearMetrics: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(() => []),
      configure: vi.fn(),
      getOptions: vi.fn(() => ({ maxHistorySize: 1000 })),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createRenderTrackerPlugin()
    expect(plugin.name).toBe('render-tracker')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createRenderTrackerPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getRenderCount).toBe('function')
    expect(typeof plugin.api?.getAverageRenderTime).toBe('function')
    expect(typeof plugin.api?.getTotalRenderTime).toBe('function')
    expect(typeof plugin.api?.getLastRenderTime).toBe('function')
    expect(typeof plugin.api?.getRenderHistory).toBe('function')
    expect(typeof plugin.api?.getSlowRenders).toBe('function')
    expect(typeof plugin.api?.getRendersByTimeRange).toBe('function')
    expect(typeof plugin.api?.getAllRenderCounts).toBe('function')
  })

  it('should track render events', () => {
    const plugin = createRenderTrackerPlugin()
    plugin.install(mockKernel)

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 10,
      phase: 'mount',
      timestamp: Date.now(),
    })

    // Check updateMetrics was called with render data
    expect(mockKernel.updateMetrics).toHaveBeenCalledWith('comp-1', expect.objectContaining({
      renderCount: 1,
      lastRenderTime: 10,
    }))
  })

  it('should get render count from metrics', () => {
    const plugin = createRenderTrackerPlugin()
    plugin.install(mockKernel)

    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      renderCount: 5,
      totalRenderTime: 50,
      averageRenderTime: 10,
      lastRenderTime: 10,
      wastedRenderCount: 0,
      mountTime: null,
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [],
      parentId: null,
      childIds: [],
    })

    expect(plugin.api?.getRenderCount('comp-1')).toBe(5)
  })

  it('should identify slow renders', () => {
    const plugin = createRenderTrackerPlugin()
    plugin.install(mockKernel)

    const slowRender: RenderRecord = {
      timestamp: Date.now(),
      duration: 25,
      phase: 'update',
      wasWasted: false,
      propsChanged: [],
    }

    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'SlowComponent',
      renderCount: 1,
      totalRenderTime: 25,
      averageRenderTime: 25,
      lastRenderTime: 25,
      wastedRenderCount: 0,
      mountTime: null,
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [slowRender],
      parentId: null,
      childIds: [],
    })

    const slowRenders = plugin.api?.getSlowRenders(16)
    expect(slowRenders?.length).toBe(1)
  })

  it('should get render history from metrics', () => {
    const plugin = createRenderTrackerPlugin()
    plugin.install(mockKernel)

    const record: RenderRecord = {
      timestamp: Date.now(),
      duration: 10,
      phase: 'mount',
      wasWasted: false,
      propsChanged: [],
    }

    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      renderCount: 1,
      totalRenderTime: 10,
      averageRenderTime: 10,
      lastRenderTime: 10,
      wastedRenderCount: 0,
      mountTime: null,
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [record],
      parentId: null,
      childIds: [],
    })

    const history = plugin.api?.getRenderHistory('comp-1')
    expect(history?.length).toBe(1)
  })

  it('should return 0 for non-existent component render count', () => {
    const plugin = createRenderTrackerPlugin()
    plugin.install(mockKernel)

    expect(plugin.api?.getRenderCount('non-existent')).toBe(0)
  })
})
