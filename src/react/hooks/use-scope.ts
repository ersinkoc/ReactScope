import { useRef, useEffect, useCallback, useMemo } from 'react'
import type { UseScopeOptions, ScopeHandle, PropsDiff, RenderEvent, MountEvent, UnmountEvent } from '../../types'
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

  // Generate component ID on first render
  if (!componentIdRef.current) {
    componentIdRef.current = uid()
  }

  const componentId = componentIdRef.current

  // Initialize metrics on mount
  useEffect(() => {
    if (!kernel) return

    const now = Date.now()
    mountTimeRef.current = now

    // Create default metrics if not exists
    if (!kernel.getMetrics().get(componentId)) {
      const defaultMetrics = createDefaultMetrics(componentId, name)
      kernel.getMetrics().set(componentId, defaultMetrics)
    }

    // Emit mount event
    const mountEvent: MountEvent = {
      type: 'mount',
      timestamp: now,
      componentId,
      componentName: name,
      parentId: null, // Parent tracking would require additional context
    }
    kernel.emit(mountEvent)

    return () => {
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
        const metrics = kernel.getMetrics().get(componentId)
        if (metrics) {
          options.onRender(metrics)
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

  // Track render on each render
  useEffect(() => {
    const startTime = performance.now()
    const phase = renderCountRef.current === 0 ? 'mount' : 'update'

    // Use requestIdleCallback to measure after paint
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        const duration = performance.now() - startTime
        trackRender(duration, phase)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        const duration = performance.now() - startTime
        trackRender(duration, phase)
      }, 0)
    }
  })

  // Create the handle
  const handle = useMemo<ScopeHandle>(() => {
    const getMetrics = () => kernel?.getMetrics().get(componentId)

    return {
      get componentId() {
        return componentId
      },
      get renderCount() {
        return getMetrics()?.renderCount ?? 0
      },
      get lastRenderTime() {
        return getMetrics()?.lastRenderTime ?? 0
      },
      get averageRenderTime() {
        return getMetrics()?.averageRenderTime ?? 0
      },
      get wastedRenders() {
        return getMetrics()?.wastedRenderCount ?? 0
      },
      get isTracking() {
        return kernel !== null && kernel.isEnabled()
      },
      trackRender,
      trackPropsChange,
    }
  }, [kernel, componentId, trackRender, trackPropsChange])

  return handle
}
