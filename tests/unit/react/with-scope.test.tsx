import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactScopeProvider, withScope } from '../../../src/react'

describe('withScope HOC', () => {
  it('should wrap component and render correctly', () => {
    function BaseComponent({ message }: { message: string }) {
      return <div data-testid="base">{message}</div>
    }

    const WrappedComponent = withScope(BaseComponent)

    render(
      <ReactScopeProvider>
        <WrappedComponent message="Hello World" />
      </ReactScopeProvider>
    )

    expect(screen.getByTestId('base')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should use provided name option', () => {
    function BaseComponent() {
      return <div>Base</div>
    }

    const WrappedComponent = withScope(BaseComponent, { name: 'CustomName' })

    render(
      <ReactScopeProvider>
        <WrappedComponent />
      </ReactScopeProvider>
    )

    expect(screen.getByText('Base')).toBeInTheDocument()
  })

  it('should call onRender callback', () => {
    const onRender = vi.fn()

    function BaseComponent() {
      return <div>Base</div>
    }

    const WrappedComponent = withScope(BaseComponent, { onRender })

    render(
      <ReactScopeProvider>
        <WrappedComponent />
      </ReactScopeProvider>
    )

    expect(onRender).toHaveBeenCalled()
  })

  it('should preserve component display name', () => {
    function MyComponent() {
      return <div>My Component</div>
    }

    const WrappedComponent = withScope(MyComponent)

    expect(WrappedComponent.displayName).toContain('MyComponent')
  })

  it('should forward ref if component supports it', () => {
    const BaseComponent = React.forwardRef<HTMLDivElement, { text: string }>(
      function BaseComponent({ text }, ref) {
        return <div ref={ref}>{text}</div>
      }
    )

    const WrappedComponent = withScope(BaseComponent)

    const ref = React.createRef<HTMLDivElement>()

    render(
      <ReactScopeProvider>
        <WrappedComponent ref={ref} text="With Ref" />
      </ReactScopeProvider>
    )

    expect(screen.getByText('With Ref')).toBeInTheDocument()
  })

  it('should handle components with no props', () => {
    function NoPropsComponent() {
      return <div>No Props</div>
    }

    const WrappedComponent = withScope(NoPropsComponent)

    render(
      <ReactScopeProvider>
        <WrappedComponent />
      </ReactScopeProvider>
    )

    expect(screen.getByText('No Props')).toBeInTheDocument()
  })
})
