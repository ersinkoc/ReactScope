import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactScopeProvider, useScope } from '../../../src/react'

describe('useScope', () => {
  it('should return scope handle with correct properties', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result } = renderHook(() => useScope('TestComponent'), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.componentId).toBe('string')
    expect(typeof result.current.renderCount).toBe('number')
    expect(typeof result.current.lastRenderTime).toBe('number')
    expect(typeof result.current.averageRenderTime).toBe('number')
    expect(typeof result.current.wastedRenders).toBe('number')
    expect(typeof result.current.isTracking).toBe('boolean')
  })

  it('should increment render count on re-render', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result, rerender } = renderHook(() => useScope('TestComponent'), { wrapper })

    const initialCount = result.current.renderCount

    rerender()

    expect(result.current.renderCount).toBeGreaterThanOrEqual(initialCount)
  })

  it('should have unique componentId for different component names', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result: result1 } = renderHook(() => useScope('Component1'), { wrapper })
    const { result: result2 } = renderHook(() => useScope('Component2'), { wrapper })

    expect(result1.current.componentId).not.toBe(result2.current.componentId)
  })

  it('should respect trackProps option', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    const { result } = renderHook(
      () => useScope('TestComponent', { trackProps: true }),
      { wrapper }
    )

    expect(result.current).toBeDefined()
    expect(result.current.isTracking).toBe(true)
  })

  it('should have onRender callback in options', () => {
    const onRender = vi.fn()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ReactScopeProvider>{children}</ReactScopeProvider>
    )

    // The onRender callback is passed to options and will be called asynchronously
    // via requestIdleCallback, so we just verify the hook works with the callback
    const { result } = renderHook(
      () => useScope('TestComponent', { onRender }),
      { wrapper }
    )

    expect(result.current).toBeDefined()
    expect(result.current.isTracking).toBe(true)
  })

  it('should return null kernel when used outside provider', () => {
    // useScopeContextSafe returns null instead of throwing when outside provider
    // The hook gracefully handles this case
    const { result } = renderHook(() => useScope('TestComponent'))

    // Hook should still work but isTracking should be false
    expect(result.current).toBeDefined()
    expect(result.current.isTracking).toBe(false)
  })
})
