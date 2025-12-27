import type { ThrottleOptions } from '../types'

export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel(): void
  flush(): ReturnType<T> | undefined
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified wait period.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options

  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let timerId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: unknown
  let result: ReturnType<T> | undefined

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined
    lastThis = undefined
    lastInvokeTime = time
    result = fn.apply(thisArg, args!) as ReturnType<T>
    return result
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = lastCallTime === undefined ? wait : time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      timeSinceLastInvoke >= wait
    )
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return Math.max(0, Math.min(timeWaiting, wait - timeSinceLastInvoke))
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timerId = undefined

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

    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time
    timerId = setTimeout(timerExpired, wait)

    if (leading) {
      return invokeFunc(time)
    }
    return result
  }

  function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time)
      }
      // Handle rapid calls
      if (trailing) {
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(time)
      }
    }

    if (timerId === undefined && trailing) {
      timerId = setTimeout(timerExpired, wait)
    }

    return result
  }

  function cancel(): void {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = undefined
    lastCallTime = undefined
    lastThis = undefined
    timerId = undefined
  }

  function flush(): ReturnType<T> | undefined {
    if (timerId === undefined) {
      return result
    }
    return trailingEdge(Date.now())
  }

  throttled.cancel = cancel
  throttled.flush = flush

  return throttled
}
