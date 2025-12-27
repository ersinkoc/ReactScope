import { describe, it, expect } from 'vitest'
import { deepEqual } from '../../../src/utils/deep-equal'

describe('deepEqual', () => {
  describe('primitives', () => {
    it('should return true for same numbers', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual(0, 0)).toBe(true)
      expect(deepEqual(-1, -1)).toBe(true)
    })

    it('should return true for same strings', () => {
      expect(deepEqual('hello', 'hello')).toBe(true)
      expect(deepEqual('', '')).toBe(true)
    })

    it('should return true for same booleans', () => {
      expect(deepEqual(true, true)).toBe(true)
      expect(deepEqual(false, false)).toBe(true)
    })

    it('should return true for null', () => {
      expect(deepEqual(null, null)).toBe(true)
    })

    it('should return true for undefined', () => {
      expect(deepEqual(undefined, undefined)).toBe(true)
    })

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false)
      expect(deepEqual('a', 'b')).toBe(false)
      expect(deepEqual(true, false)).toBe(false)
    })

    it('should return false for null vs undefined', () => {
      expect(deepEqual(null, undefined)).toBe(false)
    })

    it('should handle NaN correctly', () => {
      expect(deepEqual(NaN, NaN)).toBe(true)
    })

    it('should treat +0 and -0 as equal (common behavior)', () => {
      // Note: Our deepEqual treats +0 and -0 as equal, which is the common behavior
      // for deep equality in JavaScript (e.g., JSON.stringify, Lodash isEqual)
      expect(deepEqual(0, -0)).toBe(true)
    })
  })

  describe('objects', () => {
    it('should return true for empty objects', () => {
      expect(deepEqual({}, {})).toBe(true)
    })

    it('should return true for same reference', () => {
      const obj = { a: 1 }
      expect(deepEqual(obj, obj)).toBe(true)
    })

    it('should return true for equal objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })

    it('should return true for nested objects', () => {
      expect(deepEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 1 } } }
      )).toBe(true)
    })

    it('should return false for different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    })

    it('should return false for different lengths', () => {
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    })
  })

  describe('arrays', () => {
    it('should return true for empty arrays', () => {
      expect(deepEqual([], [])).toBe(true)
    })

    it('should return true for equal arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    })

    it('should return true for nested arrays', () => {
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true)
    })

    it('should return false for different arrays', () => {
      expect(deepEqual([1, 2], [1, 3])).toBe(false)
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('should return false for array vs object', () => {
      expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false)
    })
  })

  describe('Date', () => {
    it('should return true for same dates', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-01')
      expect(deepEqual(date1, date2)).toBe(true)
    })

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-02')
      expect(deepEqual(date1, date2)).toBe(false)
    })
  })

  describe('RegExp', () => {
    it('should return true for same regexps', () => {
      expect(deepEqual(/test/gi, /test/gi)).toBe(true)
    })

    it('should return false for different regexps', () => {
      expect(deepEqual(/test/g, /test/i)).toBe(false)
      expect(deepEqual(/test/, /other/)).toBe(false)
    })
  })

  describe('Map', () => {
    it('should return true for same maps', () => {
      const map1 = new Map([['a', 1], ['b', 2]])
      const map2 = new Map([['a', 1], ['b', 2]])
      expect(deepEqual(map1, map2)).toBe(true)
    })

    it('should return false for different maps', () => {
      const map1 = new Map([['a', 1]])
      const map2 = new Map([['a', 2]])
      expect(deepEqual(map1, map2)).toBe(false)
    })
  })

  describe('Set', () => {
    it('should return true for same sets', () => {
      const set1 = new Set([1, 2, 3])
      const set2 = new Set([1, 2, 3])
      expect(deepEqual(set1, set2)).toBe(true)
    })

    it('should return false for different sets', () => {
      const set1 = new Set([1, 2])
      const set2 = new Set([1, 3])
      expect(deepEqual(set1, set2)).toBe(false)
    })
  })

  describe('circular references', () => {
    it('should handle circular references', () => {
      const obj1: Record<string, unknown> = { a: 1 }
      obj1.self = obj1

      const obj2: Record<string, unknown> = { a: 1 }
      obj2.self = obj2

      expect(deepEqual(obj1, obj2)).toBe(true)
    })
  })

  describe('type mismatch', () => {
    it('should return false for different types', () => {
      expect(deepEqual(1, '1')).toBe(false)
      expect(deepEqual([], {})).toBe(false)
      expect(deepEqual(null, {})).toBe(false)
    })
  })
})
