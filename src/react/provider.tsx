import React, { useEffect, useRef } from 'react'
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
  const initializedRef = useRef(false)

  // Create kernel only once (survives StrictMode double-mount)
  if (!kernelRef.current) {
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
  }

  const kernel = kernelRef.current

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

  // Call onReady callback (only once)
  useEffect(() => {
    if (onReady && !initializedRef.current) {
      initializedRef.current = true
      onReady(kernel)
    }
  }, [kernel, onReady])

  // Note: We intentionally don't destroy the kernel on unmount
  // to handle React StrictMode's double-mount behavior.
  // The kernel will be garbage collected when the app unmounts.

  return (
    <ScopeContext.Provider value={kernel}>
      {children}
    </ScopeContext.Provider>
  )
}

ReactScopeProvider.displayName = 'ReactScopeProvider'
