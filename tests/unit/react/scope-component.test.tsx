import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactScopeProvider, Scope } from '../../../src/react'

describe('Scope Component', () => {
  it('should render children', () => {
    render(
      <ReactScopeProvider>
        <Scope name="TestScope">
          <div data-testid="child">Child content</div>
        </Scope>
      </ReactScopeProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should use component name as default scope name', () => {
    function NamedComponent() {
      return <div>Named</div>
    }

    render(
      <ReactScopeProvider>
        <Scope>
          <NamedComponent />
        </Scope>
      </ReactScopeProvider>
    )

    expect(screen.getByText('Named')).toBeInTheDocument()
  })

  it('should call onRender callback', () => {
    const onRender = vi.fn()

    render(
      <ReactScopeProvider>
        <Scope name="TestScope" onRender={onRender}>
          <div>Content</div>
        </Scope>
      </ReactScopeProvider>
    )

    // onRender should be called after initial render
    expect(onRender).toHaveBeenCalled()
  })

  it('should respect trackProps option', () => {
    render(
      <ReactScopeProvider>
        <Scope name="TestScope" trackProps={true}>
          <div>Content</div>
        </Scope>
      </ReactScopeProvider>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <ReactScopeProvider>
        <Scope name="MultiChild">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </Scope>
      </ReactScopeProvider>
    )

    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
    expect(screen.getByTestId('child3')).toBeInTheDocument()
  })
})
