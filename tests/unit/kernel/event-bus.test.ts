import { describe, it, expect, vi } from 'vitest'
import { createEventBus } from '../../../src/kernel/event-bus'
import type { RenderEvent, MountEvent } from '../../../src/types'

describe('EventBus', () => {
  describe('emit and on', () => {
    it('should emit and receive events', () => {
      const bus = createEventBus()
      const handler = vi.fn()

      bus.on('render', handler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(handler).toHaveBeenCalledWith(event)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should support multiple listeners for same event', () => {
      const bus = createEventBus()
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      bus.on('render', handler1)
      bus.on('render', handler2)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should not call listeners for different event types', () => {
      const bus = createEventBus()
      const renderHandler = vi.fn()
      const mountHandler = vi.fn()

      bus.on('render', renderHandler)
      bus.on('mount', mountHandler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(renderHandler).toHaveBeenCalledTimes(1)
      expect(mountHandler).not.toHaveBeenCalled()
    })
  })

  describe('off', () => {
    it('should remove listener', () => {
      const bus = createEventBus()
      const handler = vi.fn()

      bus.on('render', handler)
      bus.off('render', handler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(handler).not.toHaveBeenCalled()
    })

    it('should return unsubscribe function from on', () => {
      const bus = createEventBus()
      const handler = vi.fn()

      const unsubscribe = bus.on('render', handler)
      unsubscribe()

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('once', () => {
    it('should only call listener once', () => {
      const bus = createEventBus()
      const handler = vi.fn()

      bus.once('render', handler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)
      bus.emit(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function', () => {
      const bus = createEventBus()
      const handler = vi.fn()

      const unsubscribe = bus.once('render', handler)
      unsubscribe()

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('should remove all listeners', () => {
      const bus = createEventBus()
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      bus.on('render', handler1)
      bus.on('mount', handler2)
      bus.clear()

      const renderEvent: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      const mountEvent: MountEvent = {
        type: 'mount',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        parentId: null,
      }

      bus.emit(renderEvent)
      bus.emit(mountEvent)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('getListenerCount', () => {
    it('should return count for specific event type', () => {
      const bus = createEventBus()

      bus.on('render', vi.fn())
      bus.on('render', vi.fn())
      bus.on('mount', vi.fn())

      expect(bus.getListenerCount('render')).toBe(2)
      expect(bus.getListenerCount('mount')).toBe(1)
      expect(bus.getListenerCount('unmount')).toBe(0)
    })

    it('should return total count when no type specified', () => {
      const bus = createEventBus()

      bus.on('render', vi.fn())
      bus.on('mount', vi.fn())

      expect(bus.getListenerCount()).toBe(2)
    })
  })

  describe('error handling', () => {
    it('should continue calling other handlers if one throws', () => {
      const bus = createEventBus()
      const errorHandler = vi.fn(() => {
        throw new Error('Test error')
      })
      const successHandler = vi.fn()

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      bus.on('render', errorHandler)
      bus.on('render', successHandler)

      const event: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId: 'test',
        componentName: 'TestComponent',
        duration: 5,
        phase: 'mount',
      }

      bus.emit(event)

      expect(errorHandler).toHaveBeenCalled()
      expect(successHandler).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
