import { useState, useEffect, useCallback } from 'react'
import type { ComponentMetrics } from '../../types'
import { useScopeContextSafe } from '../context'

/**
 * Hook to read metrics for a specific component.
 * Read-only - no tracking is performed.
 */
export function useScopeMetrics(componentId: string): ComponentMetrics | undefined {
  const kernel = useScopeContextSafe()
  const [metrics, setMetrics] = useState<ComponentMetrics | undefined>(() => {
    return kernel?.getMetrics().get(componentId)
  })

  const updateMetrics = useCallback(() => {
    if (kernel) {
      setMetrics(kernel.getMetrics().get(componentId))
    }
  }, [kernel, componentId])

  useEffect(() => {
    if (!kernel) return

    // Initial update
    updateMetrics()

    // Subscribe to metrics updates
    const unsubscribe = kernel.on('metrics-update', (event) => {
      if (event.componentId === componentId) {
        setMetrics(event.metrics)
      }
    })

    return unsubscribe
  }, [kernel, componentId, updateMetrics])

  return metrics
}

/**
 * Hook to read all metrics.
 * Returns a Map of all component metrics.
 */
export function useAllScopeMetrics(): Map<string, ComponentMetrics> {
  const kernel = useScopeContextSafe()
  const [metrics, setMetrics] = useState<Map<string, ComponentMetrics>>(() => {
    return kernel?.getMetrics().getAll() ?? new Map()
  })

  useEffect(() => {
    if (!kernel) return

    // Initial update
    setMetrics(kernel.getMetrics().getAll())

    // Subscribe to any metrics updates
    const unsubscribe = kernel.on('metrics-update', () => {
      setMetrics(new Map(kernel.getMetrics().getAll()))
    })

    return unsubscribe
  }, [kernel])

  return metrics
}

/**
 * Hook to get summary statistics.
 */
export function useScopeSummary(): {
  totalComponents: number
  totalRenders: number
  totalWastedRenders: number
  averageRenderTime: number
} {
  const metrics = useAllScopeMetrics()

  let totalRenders = 0
  let totalWastedRenders = 0
  let totalRenderTime = 0

  for (const m of metrics.values()) {
    totalRenders += m.renderCount
    totalWastedRenders += m.wastedRenderCount
    totalRenderTime += m.totalRenderTime
  }

  return {
    totalComponents: metrics.size,
    totalRenders,
    totalWastedRenders,
    averageRenderTime: totalRenders > 0 ? totalRenderTime / totalRenders : 0,
  }
}
