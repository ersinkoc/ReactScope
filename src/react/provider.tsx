import React, { useEffect, useRef, useMemo } from 'react'
import type { ReactScopeProviderProps, Kernel } from '../types'
import { ScopeContext } from './context'
import { createKernel, setGlobalKernel } from '../kernel'
import {
  createRenderTrackerPlugin,
  createPropsDifferPlugin,
  createWastedRenderDetectorPlugin,
  createLifecycleTrackerPlugin,
} from '../plugins'

/**
 * ReactScopeProvider component.
 * Initializes the kernel and provides it to the component tree.
 */
export function ReactScopeProvider({
  children,
  enabled = true,
  plugins = [],
  onReady,
  options = {},
}: ReactScopeProviderProps): React.ReactElement {
  const kernelRef = useRef<Kernel | null>(null)

  // Create kernel only once
  const kernel = useMemo(() => {
    if (kernelRef.current) {
      return kernelRef.current
    }

    const k = createKernel({
      enabled,
      ...options,
    })

    // Register core plugins
    k.register(createRenderTrackerPlugin())
    k.register(createPropsDifferPlugin())
    k.register(createWastedRenderDetectorPlugin())
    k.register(createLifecycleTrackerPlugin())

    // Register user plugins
    for (const plugin of plugins) {
      k.register(plugin)
    }

    kernelRef.current = k
    setGlobalKernel(k)

    return k
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle enabled changes
  useEffect(() => {
    if (enabled) {
      kernel.enable()
    } else {
      kernel.disable()
    }
  }, [enabled, kernel])

  // Handle options changes
  useEffect(() => {
    kernel.configure(options)
  }, [kernel, options])

  // Call onReady callback
  useEffect(() => {
    if (onReady) {
      onReady(kernel)
    }
  }, [kernel, onReady])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      kernel.destroy()
      setGlobalKernel(null)
      kernelRef.current = null
    }
  }, [kernel])

  return (
    <ScopeContext.Provider value={kernel}>
      {children}
    </ScopeContext.Provider>
  )
}

ReactScopeProvider.displayName = 'ReactScopeProvider'
