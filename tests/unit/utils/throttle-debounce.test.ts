import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throttle } from '../../../src/utils/throttle'
import { debounce } from '../../../src/utils/debounce'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call function immediately on first invocation', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throttle subsequent calls', () => {
    const fn = vi.fn()
    // Disable trailing to get simpler throttle behavior for this test
    const throttled = throttle(fn, 100, { trailing: false })

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should pass arguments to the function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('arg1', 'arg2')
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should respect trailing option', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { trailing: true })

    throttled(1)
    throttled(2)
    throttled(3)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
  })

  it('should respect leading: false option', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100, { leading: false })

    throttled(1)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset delay on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    debounced('second')
    debounced('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('should respect leading option', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100, { leading: true })

    debounced(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    debounced(2)
    debounced(3)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
  })

  it('should have cancel method', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()
  })

  it('should have flush method', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test')
    debounced.flush()

    expect(fn).toHaveBeenCalledWith('test')
  })
})
