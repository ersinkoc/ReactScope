import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMemoryTrackerPlugin } from '../../../src/plugins/memory-tracker/memory-tracker'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('MemoryTrackerPlugin', () => {
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
      getOptions: vi.fn(() => ({})),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createMemoryTrackerPlugin()
    expect(plugin.name).toBe('memory-tracker')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createMemoryTrackerPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getCurrentMemory).toBe('function')
    expect(typeof plugin.api?.getMemoryHistory).toBe('function')
    expect(typeof plugin.api?.getMemoryTrend).toBe('function')
    expect(typeof plugin.api?.detectPotentialLeaks).toBe('function')
    expect(typeof plugin.api?.startMonitoring).toBe('function')
    expect(typeof plugin.api?.stopMonitoring).toBe('function')
    expect(typeof plugin.api?.isMonitoring).toBe('function')
    expect(typeof plugin.api?.getMemoryStats).toBe('function')
    expect(typeof plugin.api?.clearHistory).toBe('function')
  })

  it('should start and stop monitoring', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    expect(plugin.api?.isMonitoring()).toBe(false)

    plugin.api?.startMonitoring(100)
    expect(plugin.api?.isMonitoring()).toBe(true)

    plugin.api?.stopMonitoring()
    expect(plugin.api?.isMonitoring()).toBe(false)
  })

  it('should get current memory (may be null in test environment)', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    const memory = plugin.api?.getCurrentMemory()
    // May be null in environments without performance.memory
    expect(memory === null || typeof memory === 'object').toBe(true)
  })

  it('should get memory history', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    const history = plugin.api?.getMemoryHistory()
    expect(Array.isArray(history)).toBe(true)
  })

  it('should get memory trend', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    const trend = plugin.api?.getMemoryTrend()
    expect(['increasing', 'stable', 'decreasing']).toContain(trend)
  })

  it('should detect potential leaks', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    const leaks = plugin.api?.detectPotentialLeaks()
    expect(Array.isArray(leaks)).toBe(true)
  })

  it('should get memory stats', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    const stats = plugin.api?.getMemoryStats()
    expect(stats).toBeDefined()
    expect(typeof stats?.min).toBe('number')
    expect(typeof stats?.max).toBe('number')
    expect(typeof stats?.average).toBe('number')
  })

  it('should clear history', () => {
    const plugin = createMemoryTrackerPlugin()
    plugin.install(mockKernel)

    plugin.api?.clearHistory()

    const history = plugin.api?.getMemoryHistory()
    expect(history?.length).toBe(0)
  })
})
