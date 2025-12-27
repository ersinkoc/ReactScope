import { createContext, useContext } from 'react'
import type { Kernel } from '../types'

/**
 * React context for ReactScope kernel.
 */
export const ScopeContext = createContext<Kernel | null>(null)

/**
 * Hook to access the kernel from context.
 * Throws if used outside of ReactScopeProvider.
 */
export function useScopeContext(): Kernel {
  const kernel = useContext(ScopeContext)

  if (!kernel) {
    throw new Error('[ReactScope] useScopeContext must be used within a ReactScopeProvider')
  }

  return kernel
}

/**
 * Hook to access the kernel from context.
 * Returns null if used outside of ReactScopeProvider.
 */
export function useScopeContextSafe(): Kernel | null {
  return useContext(ScopeContext)
}

ScopeContext.displayName = 'ScopeContext'
