import React, { forwardRef, useRef, useEffect } from 'react'
import type { WithScopeOptions, RenderEvent, MountEvent, UnmountEvent } from '../../types'
import { useScopeContextSafe } from '../context'
import { uid } from '../../utils/uid'
import { shallowEqual } from '../../utils/shallow-equal'

/**
 * Higher-order component that adds profiling to a component.
 */
export function withScope<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithScopeOptions = {}
): React.ComponentType<P> {
  const displayName =
    options.name ??
    WrappedComponent.displayName ??
    WrappedComponent.name ??
    'Component'

  const WithScopeComponent = forwardRef<unknown, P>((props, ref) => {
    const kernel = useScopeContextSafe()
    const componentIdRef = useRef<string | null>(null)
    const mountedRef = useRef(false)
    const prevPropsRef = useRef<Record<string, unknown> | null>(null)
    const renderStartRef = useRef<number>(0)

    // Generate component ID on first render
    if (!componentIdRef.current) {
      componentIdRef.current = uid()
    }

    const componentId = componentIdRef.current

    // Track render start time
    renderStartRef.current = performance.now()

    // Handle mount/unmount
    useEffect(() => {
      if (!kernel || !kernel.isEnabled()) return

      if (!mountedRef.current) {
        mountedRef.current = true

        const mountEvent: MountEvent = {
          type: 'mount',
          timestamp: Date.now(),
          componentId,
          componentName: displayName,
          parentId: null,
        }
        kernel.emit(mountEvent)
      }

      return () => {
        const unmountEvent: UnmountEvent = {
          type: 'unmount',
          timestamp: Date.now(),
          componentId,
          componentName: displayName,
        }
        kernel.emit(unmountEvent)
      }
    }, [kernel, componentId])

    // Track render
    useEffect(() => {
      if (!kernel || !kernel.isEnabled()) return

      const duration = performance.now() - renderStartRef.current
      const phase = prevPropsRef.current === null ? 'mount' : 'update'

      const renderEvent: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId,
        componentName: displayName,
        duration,
        phase,
      }
      kernel.emit(renderEvent)

      // Track props changes
      if (options.trackProps && prevPropsRef.current !== null) {
        const prevProps = prevPropsRef.current
        const changes = []

        for (const key of Object.keys(props)) {
          const prev = (prevProps as Record<string, unknown>)[key]
          const next = (props as Record<string, unknown>)[key]

          if (!Object.is(prev, next)) {
            changes.push({
              key,
              prev,
              next,
              isDeepEqual: shallowEqual(prev, next),
            })
          }
        }

        if (changes.length > 0) {
          kernel.emit({
            type: 'props-change',
            timestamp: Date.now(),
            componentId,
            componentName: displayName,
            changes,
          })
        }
      }

      // Call user callback
      if (options.onRender) {
        const metrics = kernel.getMetrics().get(componentId)
        if (metrics) {
          options.onRender(metrics)
        }
      }

      // Update prev props
      prevPropsRef.current = { ...props } as Record<string, unknown>
    })

    return <WrappedComponent {...(props as P)} ref={ref} />
  })

  WithScopeComponent.displayName = `withScope(${displayName})`

  return WithScopeComponent as unknown as React.ComponentType<P>
}
