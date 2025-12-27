import type { DebounceOptions } from '../types'

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel(): void
  flush(): ReturnType<T> | undefined
  pending(): boolean
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait period has elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options

  let lastArgs: Parameters<T> | undefined
  let lastThis: unknown
  let result: ReturnType<T> | undefined
  let timerId: ReturnType<typeof setTimeout> | undefined
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let maxTimerId: ReturnType<typeof setTimeout> | undefined

  const maxing = maxWait !== undefined
  const maxWaitValue = maxing ? Math.max(maxWait, wait) : 0

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined
    lastThis = undefined
    lastInvokeTime = time
    result = fn.apply(thisArg, args!) as ReturnType<T>
    return result
  }

  function startTimer(pendingFunc: () => void, waitTime: number): ReturnType<typeof setTimeout> {
    return setTimeout(pendingFunc, waitTime)
  }

  function cancelTimer(id: ReturnType<typeof setTimeout> | undefined): void {
    if (id !== undefined) {
      clearTimeout(id)
    }
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime ?? 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing ? Math.min(timeWaiting, maxWaitValue - timeSinceLastInvoke) : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0)
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWaitValue)
    )
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timerId = undefined
    cancelTimer(maxTimerId)
    maxTimerId = undefined

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined
    lastThis = undefined
    return result
  }

  function timerExpired(): void {
    const time = Date.now()

    if (shouldInvoke(time)) {
      trailingEdge(time)
      return
    }

    timerId = startTimer(timerExpired, remainingWait(time))
  }

  function maxDelayExpired(): void {
    const time = Date.now()

    if (lastArgs) {
      cancelTimer(timerId)
      timerId = undefined
      invokeFunc(time)

      if (trailing) {
        timerId = startTimer(timerExpired, wait)
      }
    }
    maxTimerId = undefined
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time
    timerId = startTimer(timerExpired, wait)

    if (maxing) {
      maxTimerId = startTimer(maxDelayExpired, maxWaitValue)
    }

    if (leading) {
      return invokeFunc(time)
    }
    return result
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time)
      }
      if (maxing) {
        // Handle invocations in rapid succession
        cancelTimer(timerId)
        timerId = startTimer(timerExpired, wait)
        return invokeFunc(time)
      }
    }

    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }

    return result
  }

  function cancel(): void {
    cancelTimer(timerId)
    cancelTimer(maxTimerId)
    lastInvokeTime = 0
    lastArgs = undefined
    lastCallTime = undefined
    lastThis = undefined
    timerId = undefined
    maxTimerId = undefined
  }

  function flush(): ReturnType<T> | undefined {
    if (timerId === undefined) {
      return result
    }
    return trailingEdge(Date.now())
  }

  function pending(): boolean {
    return timerId !== undefined
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending

  return debounced
}
