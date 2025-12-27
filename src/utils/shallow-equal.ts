/**
 * Shallow equality check between two values.
 * Only compares first level of properties.
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  // Same reference
  if (Object.is(a, b)) {
    return true
  }

  // Handle null/undefined
  if (a == null || b == null) {
    return a === b
  }

  // Handle primitives
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) {
        return false
      }
    }
    return true
  }

  // Handle array vs non-array mismatch
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false
  }

  // Handle objects
  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) {
    return false
  }

  const objA = a as Record<string, unknown>
  const objB = b as Record<string, unknown>

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false
    }
  }

  return true
}
