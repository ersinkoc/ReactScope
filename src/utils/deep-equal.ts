/**
 * Deep equality check between two values.
 * Handles primitives, objects, arrays, Date, RegExp, Map, Set, and circular references.
 */
export function deepEqual(a: unknown, b: unknown, seen = new WeakMap<object, unknown>()): boolean {
  // Same reference or both primitives with same value
  if (Object.is(a, b)) {
    return true
  }

  // Type mismatch
  if (typeof a !== typeof b) {
    return false
  }

  // Handle null
  if (a === null || b === null) {
    return a === b
  }

  // Handle primitives
  if (typeof a !== 'object') {
    return a === b
  }

  // Both are objects at this point
  const objA = a as object
  const objB = b as object

  // Check for circular references
  if (seen.has(objA)) {
    return seen.get(objA) === objB
  }

  // Handle Date
  if (objA instanceof Date && objB instanceof Date) {
    return objA.getTime() === objB.getTime()
  }

  // Handle RegExp
  if (objA instanceof RegExp && objB instanceof RegExp) {
    return objA.source === objB.source && objA.flags === objB.flags
  }

  // Handle Map
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) {
      return false
    }
    seen.set(objA, objB)
    for (const [key, value] of objA) {
      if (!objB.has(key) || !deepEqual(value, objB.get(key), seen)) {
        return false
      }
    }
    return true
  }

  // Handle Set
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) {
      return false
    }
    seen.set(objA, objB)
    for (const value of objA) {
      // For sets, we need to check if any element in B equals the element from A
      let found = false
      for (const valueB of objB) {
        if (deepEqual(value, valueB, seen)) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }
    }
    return true
  }

  // Handle arrays
  if (Array.isArray(objA) && Array.isArray(objB)) {
    if (objA.length !== objB.length) {
      return false
    }
    seen.set(objA, objB)
    for (let i = 0; i < objA.length; i++) {
      if (!deepEqual(objA[i], objB[i], seen)) {
        return false
      }
    }
    return true
  }

  // Handle array vs non-array mismatch
  if (Array.isArray(objA) !== Array.isArray(objB)) {
    return false
  }

  // Handle different object types
  if (Object.getPrototypeOf(objA) !== Object.getPrototypeOf(objB)) {
    return false
  }

  // Handle plain objects
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  seen.set(objA, objB)

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) {
      return false
    }
    if (!deepEqual((objA as Record<string, unknown>)[key], (objB as Record<string, unknown>)[key], seen)) {
      return false
    }
  }

  return true
}
