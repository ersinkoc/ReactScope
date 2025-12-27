import { describe, it, expect } from 'vitest'
import { shallowEqual } from '../../../src/utils/shallow-equal'

describe('shallowEqual', () => {
  describe('primitives', () => {
    it('should return true for same primitives', () => {
      expect(shallowEqual(1, 1)).toBe(true)
      expect(shallowEqual('hello', 'hello')).toBe(true)
      expect(shallowEqual(true, true)).toBe(true)
      expect(shallowEqual(null, null)).toBe(true)
      expect(shallowEqual(undefined, undefined)).toBe(true)
    })

    it('should return false for different primitives', () => {
      expect(shallowEqual(1, 2)).toBe(false)
      expect(shallowEqual('a', 'b')).toBe(false)
    })

    it('should handle NaN', () => {
      expect(shallowEqual(NaN, NaN)).toBe(true)
    })
  })

  describe('objects', () => {
    it('should return true for same reference', () => {
      const obj = { a: 1 }
      expect(shallowEqual(obj, obj)).toBe(true)
    })

    it('should return true for shallow equal objects', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })

    it('should return false for different first-level values', () => {
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false)
    })

    it('should return false for different keys', () => {
      expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false)
    })

    it('should return false for nested objects with different references', () => {
      expect(shallowEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false)
    })

    it('should return true for nested objects with same reference', () => {
      const nested = { b: 1 }
      expect(shallowEqual({ a: nested }, { a: nested })).toBe(true)
    })
  })

  describe('arrays', () => {
    it('should return true for same reference', () => {
      const arr = [1, 2, 3]
      expect(shallowEqual(arr, arr)).toBe(true)
    })

    it('should return true for shallow equal arrays', () => {
      expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    })

    it('should return false for different lengths', () => {
      expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('should return false for different values', () => {
      expect(shallowEqual([1, 2], [1, 3])).toBe(false)
    })

    it('should return false for nested arrays with different references', () => {
      expect(shallowEqual([[1]], [[1]])).toBe(false)
    })
  })

  describe('null/undefined handling', () => {
    it('should return false for null vs object', () => {
      expect(shallowEqual(null, {})).toBe(false)
      expect(shallowEqual({}, null)).toBe(false)
    })

    it('should return false for undefined vs object', () => {
      expect(shallowEqual(undefined, {})).toBe(false)
      expect(shallowEqual({}, undefined)).toBe(false)
    })
  })

  describe('type mismatch', () => {
    it('should return false for array vs object', () => {
      expect(shallowEqual([], {})).toBe(false)
    })
  })
})
