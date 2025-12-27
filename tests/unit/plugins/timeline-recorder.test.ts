import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTimelineRecorderPlugin } from '../../../src/plugins/timeline-recorder/timeline-recorder'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('TimelineRecorderPlugin', () => {
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
      getOptions: vi.fn(() => ({ maxHistorySize: 10000 })),
      isEnabled: vi.fn(() => true),
      enable: vi.fn(),
      disable: vi.fn(),
      destroy: vi.fn(),
    }
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createTimelineRecorderPlugin()
    expect(plugin.name).toBe('timeline-recorder')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createTimelineRecorderPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.startRecording).toBe('function')
    expect(typeof plugin.api?.stopRecording).toBe('function')
    expect(typeof plugin.api?.isRecording).toBe('function')
    expect(typeof plugin.api?.getRecording).toBe('function')
    expect(typeof plugin.api?.clearRecording).toBe('function')
    expect(typeof plugin.api?.exportRecording).toBe('function')
    expect(typeof plugin.api?.getTimeRange).toBe('function')
    expect(typeof plugin.api?.getEventsByType).toBe('function')
  })

  it('should record render events when recording is started', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    const recording = plugin.api?.getRecording()
    expect(recording?.events?.length).toBe(1)
  })

  it('should not record events when recording is stopped', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()
    plugin.api?.stopRecording()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    const recording = plugin.api?.getRecording()
    expect(recording?.events?.length).toBe(0)
  })

  it('should record mount events', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onMount?.({
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      parentId: null,
      timestamp: Date.now(),
    })

    const recording = plugin.api?.getRecording()
    expect(recording?.events?.length).toBe(1)
    expect(recording?.events?.[0]?.type).toBe('mount')
  })

  it('should record unmount events', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onUnmount?.({
      type: 'unmount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
    })

    const recording = plugin.api?.getRecording()
    expect(recording?.events?.length).toBe(1)
    expect(recording?.events?.[0]?.type).toBe('unmount')
  })

  it('should clear recording', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    plugin.api?.clearRecording()

    const recording = plugin.api?.getRecording()
    expect(recording?.events?.length).toBe(0)
  })

  it('should export recording as JSON', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    const exported = plugin.api?.exportRecording()
    expect(typeof exported).toBe('string')
    const parsed = JSON.parse(exported!)
    expect(parsed.events).toBeDefined()
  })

  it('should get events by type', () => {
    const plugin = createTimelineRecorderPlugin()
    plugin.install(mockKernel)

    plugin.api?.startRecording()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    plugin.hooks?.onMount?.({
      type: 'mount',
      componentId: 'comp-2',
      componentName: 'OtherComponent',
      parentId: null,
      timestamp: Date.now(),
    })

    const renderEvents = plugin.api?.getEventsByType('render')
    expect(renderEvents?.length).toBe(1)
  })
})
