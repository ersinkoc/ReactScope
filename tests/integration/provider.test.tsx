import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ReactScopeProvider } from '../../src/react/provider'
import { useScopeContext } from '../../src/react/context'
import { resetGlobalKernel } from '../../src/kernel/kernel'

afterEach(() => {
  cleanup()
  resetGlobalKernel()
})

describe('ReactScopeProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ReactScopeProvider>
        <div>Hello World</div>
      </ReactScopeProvider>
    )

    expect(getByText('Hello World')).toBeDefined()
  })

  it('should provide kernel via context', () => {
    let kernel: unknown = null

    function TestComponent() {
      kernel = useScopeContext()
      return null
    }

    render(
      <ReactScopeProvider>
        <TestComponent />
      </ReactScopeProvider>
    )

    expect(kernel).toBeDefined()
    expect(typeof kernel).toBe('object')
  })

  it('should call onReady with kernel', () => {
    const onReady = vi.fn()

    render(
      <ReactScopeProvider onReady={onReady}>
        <div>Test</div>
      </ReactScopeProvider>
    )

    expect(onReady).toHaveBeenCalled()
    expect(onReady.mock.calls[0]?.[0]).toBeDefined()
  })

  it('should respect enabled prop', () => {
    let kernel: ReturnType<typeof useScopeContext> | null = null

    function TestComponent() {
      kernel = useScopeContext()
      return null
    }

    render(
      <ReactScopeProvider enabled={false}>
        <TestComponent />
      </ReactScopeProvider>
    )

    expect(kernel?.isEnabled()).toBe(false)
  })

  it('should register custom plugins', () => {
    const plugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
      uninstall: vi.fn(),
    }

    let kernel: ReturnType<typeof useScopeContext> | null = null

    function TestComponent() {
      kernel = useScopeContext()
      return null
    }

    render(
      <ReactScopeProvider plugins={[plugin]}>
        <TestComponent />
      </ReactScopeProvider>
    )

    expect(plugin.install).toHaveBeenCalled()
    expect(kernel?.getPlugin('test-plugin')).toBe(plugin)
  })
})
