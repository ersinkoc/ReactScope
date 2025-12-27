import React, { Profiler, useRef, useCallback } from 'react'
import type { ScopeProps, RenderEvent, MountEvent, UnmountEvent } from '../../types'
import { useScopeContextSafe } from '../context'
import { uid } from '../../utils/uid'

/**
 * Scope component.
 * Wraps children and tracks their render performance.
 */
export function Scope({
  children,
  name,
  onRender,
  trackProps: _trackProps = true,
}: ScopeProps): React.ReactElement {
  const kernel = useScopeContextSafe()
  const componentIdRef = useRef<string | null>(null)
  const mountedRef = useRef(false)

  // Generate component ID on first render
  if (!componentIdRef.current) {
    componentIdRef.current = uid()
  }

  const componentId = componentIdRef.current
  const componentName = name ?? 'Scope'

  const handleRender = useCallback(
    (
      _id: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      _baseDuration: number,
      _startTime: number,
      _commitTime: number
    ) => {
      if (!kernel || !kernel.isEnabled()) return

      // Emit mount event on first render
      if (!mountedRef.current) {
        mountedRef.current = true

        const mountEvent: MountEvent = {
          type: 'mount',
          timestamp: Date.now(),
          componentId,
          componentName,
          parentId: null,
        }
        kernel.emit(mountEvent)
      }

      // Emit render event
      const renderPhase = phase === 'mount' ? 'mount' : 'update'
      const renderEvent: RenderEvent = {
        type: 'render',
        timestamp: Date.now(),
        componentId,
        componentName,
        duration: actualDuration,
        phase: renderPhase,
      }
      kernel.emit(renderEvent)

      // Call user callback
      if (onRender) {
        const metrics = kernel.getMetrics().get(componentId)
        if (metrics) {
          onRender(metrics)
        }
      }
    },
    [kernel, componentId, componentName, onRender]
  )

  // Handle unmount
  React.useEffect(() => {
    return () => {
      if (kernel && mountedRef.current) {
        const unmountEvent: UnmountEvent = {
          type: 'unmount',
          timestamp: Date.now(),
          componentId,
          componentName,
        }
        kernel.emit(unmountEvent)
      }
    }
  }, [kernel, componentId, componentName])

  return (
    <Profiler id={componentId} onRender={handleRender}>
      {children}
    </Profiler>
  )
}

Scope.displayName = 'Scope'
