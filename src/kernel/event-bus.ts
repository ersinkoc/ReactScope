import type { KernelEvent, EventBus as IEventBus } from '../types'

type EventHandler<T extends KernelEvent = KernelEvent> = (event: T) => void

/**
 * Event bus implementation for kernel events.
 * Provides pub/sub functionality with type-safe event handling.
 */
export class EventBusImpl implements IEventBus {
  private listeners = new Map<string, Set<EventHandler>>()
  private onceListeners = new Map<string, Set<EventHandler>>()

  /**
   * Emit an event to all registered listeners.
   */
  emit(event: KernelEvent): void {
    const type = event.type

    // Call regular listeners
    const handlers = this.listeners.get(type)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event)
        } catch (error) {
          console.error(`[ReactScope] Error in event handler for "${type}":`, error)
        }
      }
    }

    // Call and remove once listeners
    const onceHandlers = this.onceListeners.get(type)
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        try {
          handler(event)
        } catch (error) {
          console.error(`[ReactScope] Error in once event handler for "${type}":`, error)
        }
      }
      this.onceListeners.delete(type)
    }
  }

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    const handlers = this.listeners.get(eventType)!
    handlers.add(handler as EventHandler)

    return () => this.off(eventType, handler as EventHandler)
  }

  /**
   * Unsubscribe from an event type.
   */
  off(eventType: string, handler: Function): void {
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      handlers.delete(handler as EventHandler)
      if (handlers.size === 0) {
        this.listeners.delete(eventType)
      }
    }

    const onceHandlers = this.onceListeners.get(eventType)
    if (onceHandlers) {
      onceHandlers.delete(handler as EventHandler)
      if (onceHandlers.size === 0) {
        this.onceListeners.delete(eventType)
      }
    }
  }

  /**
   * Subscribe to an event type for a single occurrence.
   * Returns an unsubscribe function.
   */
  once<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set())
    }

    const handlers = this.onceListeners.get(eventType)!
    handlers.add(handler as EventHandler)

    return () => {
      const onceHandlers = this.onceListeners.get(eventType)
      if (onceHandlers) {
        onceHandlers.delete(handler as EventHandler)
        if (onceHandlers.size === 0) {
          this.onceListeners.delete(eventType)
        }
      }
    }
  }

  /**
   * Clear all listeners.
   */
  clear(): void {
    this.listeners.clear()
    this.onceListeners.clear()
  }

  /**
   * Get the number of listeners for an event type.
   * If no event type is specified, returns total listener count.
   */
  getListenerCount(eventType?: string): number {
    if (eventType) {
      const regular = this.listeners.get(eventType)?.size ?? 0
      const once = this.onceListeners.get(eventType)?.size ?? 0
      return regular + once
    }

    let total = 0
    for (const handlers of this.listeners.values()) {
      total += handlers.size
    }
    for (const handlers of this.onceListeners.values()) {
      total += handlers.size
    }
    return total
  }

  /**
   * Check if there are any listeners for an event type.
   */
  hasListeners(eventType: string): boolean {
    return this.getListenerCount(eventType) > 0
  }

  /**
   * Get all registered event types.
   */
  getEventTypes(): string[] {
    const types = new Set<string>()
    for (const type of this.listeners.keys()) {
      types.add(type)
    }
    for (const type of this.onceListeners.keys()) {
      types.add(type)
    }
    return Array.from(types)
  }
}

/**
 * Create a new event bus instance.
 */
export function createEventBus(): IEventBus {
  return new EventBusImpl()
}
