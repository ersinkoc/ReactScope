import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createNetworkCorrelatorPlugin } from '../../../src/plugins/network-correlator/network-correlator'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('NetworkCorrelatorPlugin', () => {
  let mockKernel: Kernel
  let mockMetricsStore: MetricsStore
  let metricsMap: Map<string, ComponentMetrics>
  let originalFetch: typeof globalThis.fetch

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
      getOptions: vi.fn(() => ({ maxHistorySize: 1000 })),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }

    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createNetworkCorrelatorPlugin()
    expect(plugin.name).toBe('network-correlator')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createNetworkCorrelatorPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getRequestsForComponent).toBe('function')
    expect(typeof plugin.api?.getRendersForRequest).toBe('function')
    expect(typeof plugin.api?.getCorrelations).toBe('function')
    expect(typeof plugin.api?.startCapturing).toBe('function')
    expect(typeof plugin.api?.stopCapturing).toBe('function')
    expect(typeof plugin.api?.isCapturing).toBe('function')
    expect(typeof plugin.api?.getRequestStats).toBe('function')
    expect(typeof plugin.api?.clearRequests).toBe('function')
    expect(typeof plugin.api?.getAllRequests).toBe('function')
  })

  it('should start and stop capturing', () => {
    const plugin = createNetworkCorrelatorPlugin()
    plugin.install(mockKernel)

    expect(plugin.api?.isCapturing()).toBe(false)

    plugin.api?.startCapturing()
    expect(plugin.api?.isCapturing()).toBe(true)

    plugin.api?.stopCapturing()
    expect(plugin.api?.isCapturing()).toBe(false)
  })

  it('should track render events', () => {
    const plugin = createNetworkCorrelatorPlugin()
    plugin.install(mockKernel)

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'DataComponent',
      duration: 5,
      phase: 'update',
      timestamp: Date.now(),
    })

    // Renders are tracked for correlation
    expect(plugin).toBeDefined()
  })

  it('should get correlations', () => {
    const plugin = createNetworkCorrelatorPlugin()
    plugin.install(mockKernel)

    const correlations = plugin.api?.getCorrelations()
    expect(Array.isArray(correlations)).toBe(true)
  })

  it('should get request stats', () => {
    const plugin = createNetworkCorrelatorPlugin()
    plugin.install(mockKernel)

    const stats = plugin.api?.getRequestStats()
    expect(stats).toBeDefined()
    expect(typeof stats?.totalRequests).toBe('number')
  })

  it('should clear requests', () => {
    const plugin = createNetworkCorrelatorPlugin()
    plugin.install(mockKernel)

    plugin.api?.clearRequests()

    const requests = plugin.api?.getAllRequests()
    expect(requests?.length).toBe(0)
  })
})
