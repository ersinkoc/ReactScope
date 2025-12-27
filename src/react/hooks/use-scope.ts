import { useRef, useEffect, useCallback, useState } from 'react'
import type { UseScopeOptions, ScopeHandle, PropsDiff, RenderEvent, MountEvent, UnmountEvent, ComponentMetrics } from '../../types'
import { useScopeContextSafe } from '../context'
import { uid } from '../../utils/uid'
import { createDefaultMetrics } from '../../kernel/metrics-store'

/**
 * Hook for profiling a component.
 * Returns a handle with render metrics and tracking functions.
 */
export function useScope(name: string, options: UseScopeOptions = {}): ScopeHandle {
  const kernel = useScopeContextSafe()
  const componentIdRef = useRef<string | null>(null)
  const renderCountRef = useRef(0)
  const mountTimeRef = useRef<number | null>(null)
  const isMetricsUpdateRef = useRef(false)
  const lastTrackedRenderRef = useRef(0)

  // Generate component ID on first render
  if (!componentIdRef.current) {
    componentIdRef.current = uid()
  }

  const componentId = componentIdRef.current

  // State to trigger re-renders when metrics update
  const [metrics, setMetrics] = useState<ComponentMetrics | null>(null)

  // Initialize metrics on mount and subscribe to updates
  useEffect(() => {
    if (!kernel) return

    const now = Date.now()
    mountTimeRef.current = now

    // Create default metrics if not exists
    if (!kernel.getMetrics().get(componentId)) {
      const defaultMetrics = createDefaultMetrics(componentId, name)
      kernel.getMetrics().set(componentId, defaultMetrics)
    }

    // Set initial metrics (mark as metrics update to skip tracking)
    isMetricsUpdateRef.current = true
    setMetrics(kernel.getMetrics().get(componentId) ?? null)

    // Subscribe to metrics updates for this component
    const unsubscribe = kernel.on('metrics-update', (event) => {
      if (event.componentId === componentId) {
        // Mark that next render is due to metrics update
        isMetricsUpdateRef.current = true
        setMetrics(event.metrics)
      }
    })

    // Emit mount event
    const mountEvent: MountEvent = {
      type: 'mount',
      timestamp: now,
      componentId,
      componentName: name,
      parentId: null,
    }
    kernel.emit(mountEvent)

    return () => {
      unsubscribe()
      // Emit unmount event
      const unmountEvent: UnmountEvent = {
        type: 'unmount',
        timestamp: Date.now(),
        componentId,
        componentName: name,
      }
      kernel.emit(unmountEvent)
    }
  }, [kernel, componentId, name])

  // Track render
  const trackRender = useCallback(
    (duration: number, phase: 'mount' | 'update') => {
      if (!kernel) return

      renderCountRef.current++

      const renderEvent: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId,
        componentName: name,
        duration,
        phase,
      }

      kernel.emit(renderEvent)

      if (options.onRender) {
        const currentMetrics = kernel.getMetrics().get(componentId)
        if (currentMetrics) {
          options.onRender(currentMetrics)
        }
      }
    },
    [kernel, componentId, name, options]
  )

  // Track props change
  const trackPropsChange = useCallback(
    (changes: PropsDiff[]) => {
      if (!kernel || changes.length === 0) return

      kernel.emit({
        type: 'props-change',
        timestamp: Date.now(),
        componentId,
        componentName: name,
        changes,
      })
    },
    [kernel, componentId, name]
  )

  // Track render on each render (but skip metrics-triggered re-renders)
  useEffect(() => {
    // Skip tracking if this render was triggered by a metrics update
    if (isMetricsUpdateRef.current) {
      isMetricsUpdateRef.current = false
      return
    }

    const currentRender = ++lastTrackedRenderRef.current
    const startTime = performance.now()
    const phase = renderCountRef.current === 0 ? 'mount' : 'update'

    // Use requestIdleCallback to measure after paint
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        // Only track if this is still the latest render
        if (currentRender === lastTrackedRenderRef.current) {
          const duration = performance.now() - startTime
          trackRender(duration, phase)
        }
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        if (currentRender === lastTrackedRenderRef.current) {
          const duration = performance.now() - startTime
          trackRender(duration, phase)
        }
      }, 0)
    }
  })

  // Create the handle with current metrics
  const handle: ScopeHandle = {
    get componentId() {
      return componentId
    },
    get renderCount() {
      return metrics?.renderCount ?? 0
    },
    get lastRenderTime() {
      return metrics?.lastRenderTime ?? 0
    },
    get averageRenderTime() {
      return metrics?.averageRenderTime ?? 0
    },
    get wastedRenders() {
      return metrics?.wastedRenderCount ?? 0
    },
    get isTracking() {
      return kernel !== null && kernel.isEnabled()
    },
    trackRender,
    trackPropsChange,
  }

  return handle
}
