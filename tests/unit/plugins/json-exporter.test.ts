import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createJSONExporterPlugin } from '../../../src/plugins/json-exporter/json-exporter'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('JSONExporterPlugin', () => {
  let mockKernel: Kernel
  let mockMetricsStore: MetricsStore
  let metricsMap: Map<string, ComponentMetrics>

  beforeEach(() => {
    metricsMap = new Map([
      [
        'comp-1',
        {
          componentId: 'comp-1',
          componentName: 'TestComponent',
          renderCount: 5,
          totalRenderTime: 25,
          lastRenderTime: 5,
          averageRenderTime: 5,
          wastedRenderCount: 1,
          mountTime: Date.now() - 10000,
          unmountTime: null,
          isCurrentlyMounted: true,
          mountCount: 1,
          propsChangeCount: 0,
          renderHistory: [],
          parentId: null,
          childIds: [],
        },
      ],
    ])

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
      getSessionStart: vi.fn(() => Date.now() - 10000),
      getLastUpdate: vi.fn(() => Date.now()),
      getSessionDuration: vi.fn(() => 10000),
      getData: vi.fn(() => ({
        components: metricsMap,
        tree: { root: null, nodeMap: new Map() },
        timeline: [],
        sessionStart: Date.now() - 10000,
        lastUpdate: Date.now(),
      })),
    }

    mockKernel = {
      emit: vi.fn(),
      on: vi.fn(() => () => {}),
      getMetrics: vi.fn(() => mockMetricsStore),
      updateMetrics: vi.fn(),
      getComponentMetrics: vi.fn((id) => metricsMap.get(id)),
      clearMetrics: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(() => []),
      configure: vi.fn(),
      getOptions: vi.fn(() => ({})),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createJSONExporterPlugin()
    expect(plugin.name).toBe('json-exporter')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createJSONExporterPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.exportAll).toBe('function')
    expect(typeof plugin.api?.exportComponent).toBe('function')
    expect(typeof plugin.api?.exportSummary).toBe('function')
    expect(typeof plugin.api?.getSerializableMetrics).toBe('function')
    expect(typeof plugin.api?.downloadJSON).toBe('function')
  })

  it('should export metrics as JSON string', () => {
    const plugin = createJSONExporterPlugin()
    plugin.install(mockKernel)

    const exported = plugin.api?.exportAll() as string
    expect(typeof exported).toBe('string')

    const parsed = JSON.parse(exported)
    expect(parsed).toBeDefined()
  })

  it('should export component metrics', () => {
    const plugin = createJSONExporterPlugin()
    plugin.install(mockKernel)

    const exported = plugin.api?.exportComponent('comp-1') as string
    expect(typeof exported).toBe('string')

    const parsed = JSON.parse(exported)
    expect(parsed.componentName).toBe('TestComponent')
  })

  it('should export summary', () => {
    const plugin = createJSONExporterPlugin()
    plugin.install(mockKernel)

    const summary = plugin.api?.exportSummary()
    expect(summary).toBeDefined()
    expect(typeof summary?.totalComponents).toBe('number')
    expect(typeof summary?.totalRenders).toBe('number')
  })

  it('should get serializable metrics', () => {
    const plugin = createJSONExporterPlugin()
    plugin.install(mockKernel)

    const serializable = plugin.api?.getSerializableMetrics()
    expect(serializable).toBeDefined()
    expect(Array.isArray(serializable?.components)).toBe(true)
  })
})
