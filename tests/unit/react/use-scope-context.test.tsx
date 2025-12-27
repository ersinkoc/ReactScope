import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ReactScopeProvider, useScopeContext } from '../../../src/react'

describe('useScopeContext', () => {
  it('should return kernel instance', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result } = renderHook(() => useScopeContext(), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.emit).toBe('function')
    expect(typeof result.current.on).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.unregister).toBe('function')
    expect(typeof result.current.getPlugin).toBe('function')
    expect(typeof result.current.getPlugins).toBe('function')
    expect(typeof result.current.getMetrics).toBe('function')
    expect(typeof result.current.clearMetrics).toBe('function')
    expect(typeof result.current.isEnabled).toBe('function')
  })

  it('should allow plugin access', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result } = renderHook(() => useScopeContext(), { wrapper })

    const plugins = result.current.getPlugins()
    expect(Array.isArray(plugins)).toBe(true)
  })

  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useScopeContext())
    }).toThrow()

    consoleError.mockRestore()
  })
})
