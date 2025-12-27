import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createConsoleReporterPlugin } from '../../../src/plugins/console-reporter/console-reporter'
import type { Kernel, MetricsStore, ComponentMetrics } from '../../../src/types'

describe('ConsoleReporterPlugin', () => {
  let mockKernel: Kernel
  let mockMetricsStore: MetricsStore
  let metricsMap: Map<string, ComponentMetrics>
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

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

    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleDebugSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('should create plugin with correct name and version', () => {
    const plugin = createConsoleReporterPlugin()
    expect(plugin.name).toBe('console-reporter')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should have required API methods', () => {
    const plugin = createConsoleReporterPlugin()
    expect(plugin.api).toBeDefined()
    expect(typeof plugin.api?.setLogLevel).toBe('function')
    expect(typeof plugin.api?.getLogLevel).toBe('function')
    expect(typeof plugin.api?.setFilter).toBe('function')
    expect(typeof plugin.api?.pause).toBe('function')
    expect(typeof plugin.api?.resume).toBe('function')
    expect(typeof plugin.api?.isPaused).toBe('function')
    expect(typeof plugin.api?.log).toBe('function')
  })

  it('should log renders at debug level', () => {
    const plugin = createConsoleReporterPlugin({ logLevel: 'debug' })
    plugin.install(mockKernel)

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    expect(consoleDebugSpy).toHaveBeenCalled()
  })

  it('should not log when paused', () => {
    const plugin = createConsoleReporterPlugin({ logLevel: 'debug' })
    plugin.install(mockKernel)

    plugin.api?.pause()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    expect(consoleDebugSpy).not.toHaveBeenCalled()
  })

  it('should resume logging after resume', () => {
    const plugin = createConsoleReporterPlugin({ logLevel: 'debug' })
    plugin.install(mockKernel)

    plugin.api?.pause()
    plugin.api?.resume()

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      duration: 5,
      phase: 'mount',
      timestamp: Date.now(),
    })

    expect(consoleDebugSpy).toHaveBeenCalled()
  })

  it('should warn for slow renders', () => {
    const plugin = createConsoleReporterPlugin({ logLevel: 'debug' })
    plugin.install(mockKernel)

    plugin.hooks?.onRender?.({
      type: 'render',
      componentId: 'comp-1',
      componentName: 'SlowComponent',
      duration: 25, // Slow render (> 16ms)
      phase: 'update',
      timestamp: Date.now(),
    })

    expect(consoleWarnSpy).toHaveBeenCalled()
  })

  it('should log custom messages via API', () => {
    const plugin = createConsoleReporterPlugin({ logLevel: 'info' })
    plugin.install(mockKernel)

    plugin.api?.log('Custom message', 'info')

    expect(consoleInfoSpy).toHaveBeenCalled()
  })
})
