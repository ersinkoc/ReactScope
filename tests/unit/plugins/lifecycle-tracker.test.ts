import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLifecycleTrackerPlugin } from '../../../src/plugins/lifecycle-tracker/lifecycle-tracker'
import type { Kernel, MetricsStore, ComponentMetrics, MountEvent, UnmountEvent } from '../../../src/types'

describe('LifecycleTrackerPlugin', () => {
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
      getOptions: vi.fn(() => ({ maxHistorySize: 100 })),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createLifecycleTrackerPlugin()
    expect(plugin.name).toBe('lifecycle-tracker')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createLifecycleTrackerPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.getMountTime).toBe('function')
    expect(typeof plugin.api?.getUnmountTime).toBe('function')
    expect(typeof plugin.api?.getLifetime).toBe('function')
    expect(typeof plugin.api?.getMountCount).toBe('function')
    expect(typeof plugin.api?.isCurrentlyMounted).toBe('function')
    expect(typeof plugin.api?.getLifecycleHistory).toBe('function')
    expect(typeof plugin.api?.getMountedComponents).toBe('function')
    expect(typeof plugin.api?.getAverageLifetime).toBe('function')
    expect(typeof plugin.api?.getAllMountCounts).toBe('function')
  })

  it('should track mount events', () => {
    const plugin = createLifecycleTrackerPlugin()
    plugin.install(mockKernel)

    const mountEvent: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      parentId: null,
      timestamp: Date.now(),
    }

    plugin.hooks?.onMount?.(mountEvent)

    // Check that updateMetrics was called with isCurrentlyMounted: true
    expect(mockKernel.updateMetrics).toHaveBeenCalledWith('comp-1', expect.objectContaining({
      isCurrentlyMounted: true,
    }))
  })

  it('should track unmount events', () => {
    const plugin = createLifecycleTrackerPlugin()
    plugin.install(mockKernel)

    const mountTime = Date.now()

    // First mount the component
    const mountEvent: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      parentId: null,
      timestamp: mountTime,
    }
    plugin.hooks?.onMount?.(mountEvent)

    // Then unmount
    const unmountEvent: UnmountEvent = {
      type: 'unmount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: mountTime + 1000,
    }
    plugin.hooks?.onUnmount?.(unmountEvent)

    // Check that updateMetrics was called with isCurrentlyMounted: false
    expect(mockKernel.updateMetrics).toHaveBeenCalledWith('comp-1', expect.objectContaining({
      isCurrentlyMounted: false,
    }))
  })

  it('should get mount time from metrics', () => {
    const plugin = createLifecycleTrackerPlugin()
    plugin.install(mockKernel)

    const mountTime = Date.now()
    metricsMap.set('comp-1', {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      wastedRenderCount: 0,
      mountTime: mountTime,
      unmountTime: null,
      isCurrentlyMounted: true,
      mountCount: 1,
      propsChangeCount: 0,
      renderHistory: [],
      parentId: null,
      childIds: [],
    })

    expect(plugin.api?.getMountTime('comp-1')).toBe(mountTime)
  })

  it('should return null for non-existent component mount time', () => {
    const plugin = createLifecycleTrackerPlugin()
    plugin.install(mockKernel)

    expect(plugin.api?.getMountTime('non-existent')).toBeNull()
  })

  it('should get lifecycle history', () => {
    const plugin = createLifecycleTrackerPlugin()
    plugin.install(mockKernel)

    const mountEvent: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      parentId: null,
      timestamp: Date.now(),
    }
    plugin.hooks?.onMount?.(mountEvent)

    const history = plugin.api?.getLifecycleHistory('comp-1')
    expect(Array.isArray(history)).toBe(true)
    expect(history?.length).toBe(1)
    expect(history?.[0]?.type).toBe('mount')
  })
})
