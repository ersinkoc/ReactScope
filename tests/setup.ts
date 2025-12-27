import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Reset all mocks after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

// Mock requestIdleCallback if not available
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
    return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1)
  }) as typeof requestIdleCallback
  globalThis.cancelIdleCallback = ((id: number) => {
    clearTimeout(id)
  }) as typeof cancelIdleCallback
}

// Mock performance.memory for non-Chrome environments
if (typeof performance !== 'undefined' && !('memory' in performance)) {
  Object.defineProperty(performance, 'memory', {
    value: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 2190000000,
    },
    configurable: true,
  })
}
