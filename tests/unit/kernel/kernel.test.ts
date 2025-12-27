import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createKernel, resetGlobalKernel, getKernel } from '../../../src/kernel/kernel'
import type { Plugin, RenderEvent } from '../../../src/types'

describe('Kernel', () => {
  afterEach(() => {
    resetGlobalKernel()
  })

  describe('createKernel', () => {
    it('should create a kernel with default options', () => {
      const kernel = createKernel()

      expect(kernel).toBeDefined()
      expect(kernel.isEnabled()).toBe(true)
    })

    it('should create a kernel with custom options', () => {
      const kernel = createKernel({ enabled: false })

      expect(kernel.isEnabled()).toBe(false)
    })
  })

  describe('enable/disable', () => {
    it('should enable the kernel', () => {
      const kernel = createKernel({ enabled: false })

      kernel.enable()

      expect(kernel.isEnabled()).toBe(true)
    })

    it('should disable the kernel', () => {
      const kernel = createKernel()

      kernel.disable()

      expect(kernel.isEnabled()).toBe(false)
    })
  })

  describe('plugins', () => {
    it('should register a plugin', () => {
      const kernel = createKernel()
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      kernel.register(plugin)

      expect(plugin.install).toHaveBeenCalledWith(kernel)
      expect(kernel.getPlugin('test-plugin')).toBe(plugin)
    })

    it('should unregister a plugin', () => {
      const kernel = createKernel()
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      kernel.register(plugin)
      kernel.unregister('test-plugin')

      expect(plugin.uninstall).toHaveBeenCalled()
      expect(kernel.getPlugin('test-plugin')).toBeUndefined()
    })

    it('should throw when registering duplicate plugin', () => {
      const kernel = createKernel()
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      kernel.register(plugin)

      expect(() => kernel.register(plugin)).toThrow()
    })

    it('should call plugin hooks on events', () => {
      const kernel = createKernel()
      const onRender = vi.fn()
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
        hooks: { onRender },
      }

      kernel.register(plugin)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      kernel.emit(event)

      expect(onRender).toHaveBeenCalledWith(event)
    })

    it('should get all plugins', () => {
      const kernel = createKernel()
      const plugin1: Plugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }
      const plugin2: Plugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      kernel.register(plugin1)
      kernel.register(plugin2)

      const plugins = kernel.getPlugins()

      expect(plugins).toHaveLength(2)
    })
  })

  describe('events', () => {
    it('should emit events to listeners', () => {
      const kernel = createKernel()
      const handler = vi.fn()

      kernel.on('render', handler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      kernel.emit(event)

      expect(handler).toHaveBeenCalledWith(event)
    })

    it('should not emit events when disabled', () => {
      const kernel = createKernel({ enabled: false })
      const handler = vi.fn()

      kernel.on('render', handler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      kernel.emit(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('metrics', () => {
    it('should update metrics', () => {
      const kernel = createKernel()

      kernel.updateMetrics('comp1', {
        componentName: 'TestComponent',
        renderCount: 1,
      })

      const metrics = kernel.getComponentMetrics('comp1')

      expect(metrics).toBeDefined()
      expect(metrics?.componentName).toBe('TestComponent')
      expect(metrics?.renderCount).toBe(1)
    })

    it('should clear metrics', () => {
      const kernel = createKernel()

      kernel.updateMetrics('comp1', { componentName: 'Test' })
      kernel.clearMetrics()

      expect(kernel.getComponentMetrics('comp1')).toBeUndefined()
    })

    it('should return metrics store', () => {
      const kernel = createKernel()

      const store = kernel.getMetrics()

      expect(store).toBeDefined()
      expect(store.getAll()).toBeDefined()
    })
  })

  describe('configuration', () => {
    it('should configure options', () => {
      const kernel = createKernel()

      kernel.configure({ sampleRate: 0.5 })

      expect(kernel.getOptions().sampleRate).toBe(0.5)
    })
  })

  describe('destroy', () => {
    it('should destroy the kernel', () => {
      const kernel = createKernel()
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      kernel.register(plugin)
      kernel.destroy()

      expect(plugin.uninstall).toHaveBeenCalled()
      expect(kernel.isEnabled()).toBe(false)
    })

    it('should not allow registration after destroy', () => {
      const kernel = createKernel()
      kernel.destroy()

      expect(() => {
        kernel.register({
          name: 'test',
          version: '1.0.0',
          install: vi.fn(),
          uninstall: vi.fn(),
        })
      }).toThrow()
    })
  })

  describe('global kernel', () => {
    it('should get global kernel', () => {
      const kernel = getKernel()

      expect(kernel).toBeDefined()
    })

    it('should return same instance', () => {
      const kernel1 = getKernel()
      const kernel2 = getKernel()

      expect(kernel1).toBe(kernel2)
    })
  })
})
