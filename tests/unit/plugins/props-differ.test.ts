import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPropsDifferPlugin } from '../../../src/plugins/props-differ/props-differ'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('PropsDifferPlugin', () => {
  let mockKernel: Kernel
  let mockMetricsStore: MetricsStore
  let metricsMap: Map<string, ComponentMetrics>

  beforeEach(() => {
    metricsMap = new Map()
    mockMetricsStore = {
      get: vi.fn((id: string) => metricsMap.get(id)),
      set: vi.fn(),
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
    const plugin = createPropsDifferPlugin()
    expect(plugin.name).toBe('props-differ')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createPropsDifferPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getPropsHistory).toBe('function')
    expect(typeof plugin.api?.getLastChange).toBe('function')
    expect(typeof plugin.api?.getChangeFrequency).toBe('function')
    expect(typeof plugin.api?.getMostChangedProps).toBe('function')
    expect(typeof plugin.api?.compareProps).toBe('function')
    expect(typeof plugin.api?.clearHistory).toBe('function')
  })

  it('should track props changes', () => {
    const plugin = createPropsDifferPlugin()
    plugin.install(mockKernel)

    plugin.hooks?.onPropsChange?.({
      type: 'props-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      changes: [
        { key: 'name', prev: 'old', next: 'new', isDeepEqual: false },
        { key: 'count', prev: 1, next: 2, isDeepEqual: false },
      ],
      timestamp: Date.now(),
    })

    const lastChange = plugin.api?.getLastChange('comp-1')
    expect(lastChange).toBeDefined()
    expect(lastChange?.length).toBe(2)
  })

  it('should identify most changed props', () => {
    const plugin = createPropsDifferPlugin()
    plugin.install(mockKernel)

    // Simulate multiple prop changes
    for (let i = 0; i < 5; i++) {
      plugin.hooks?.onPropsChange?.({
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        changes: [{ key: 'count', prev: i, next: i + 1, isDeepEqual: false }],
        timestamp: Date.now(),
      })
    }

    for (let i = 0; i < 2; i++) {
      plugin.hooks?.onPropsChange?.({
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        changes: [{ key: 'name', prev: `name${i}`, next: `name${i + 1}`, isDeepEqual: false }],
        timestamp: Date.now(),
      })
    }

    const mostChanged = plugin.api?.getMostChangedProps('comp-1', 2)
    expect(mostChanged).toBeDefined()
    expect(mostChanged?.length).toBe(2)
    expect(mostChanged?.[0]?.key).toBe('count')
    expect(mostChanged?.[0]?.changeCount).toBe(5)
  })

  it('should compare props', () => {
    const plugin = createPropsDifferPlugin()

    const diffs = plugin.api?.compareProps(
      { name: 'old', count: 1 },
      { name: 'new', count: 1 }
    )

    expect(diffs).toBeDefined()
    expect(diffs?.length).toBe(1)
    expect(diffs?.[0]?.key).toBe('name')
  })

  it('should clear history', () => {
    const plugin = createPropsDifferPlugin()
    plugin.install(mockKernel)

    plugin.hooks?.onPropsChange?.({
      type: 'props-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      changes: [{ key: 'name', prev: 'old', next: 'new', isDeepEqual: false }],
      timestamp: Date.now(),
    })

    plugin.api?.clearHistory('comp-1')

    const lastChange = plugin.api?.getLastChange('comp-1')
    expect(lastChange).toBeNull()
  })
})
