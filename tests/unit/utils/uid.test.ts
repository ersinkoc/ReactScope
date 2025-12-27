import { describe, it, expect } from 'vitest'
import { uid, createIdGenerator, shortId } from '../../../src/utils/uid'

describe('uid', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      ids.add(uid())
    }
    expect(ids.size).toBe(1000)
  })

  it('should return a string', () => {
    expect(typeof uid()).toBe('string')
  })

  it('should contain a hyphen', () => {
    expect(uid()).toContain('-')
  })
})

describe('createIdGenerator', () => {
  it('should create generator without prefix', () => {
    const generator = createIdGenerator()
    const id1 = generator()
    const id2 = generator()

    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })

  it('should create generator with prefix', () => {
    const generator = createIdGenerator('test')
    const id = generator()

    expect(id.startsWith('test-')).toBe(true)
  })

  it('should generate unique IDs', () => {
    const generator = createIdGenerator('prefix')
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generator())
    }
    expect(ids.size).toBe(100)
  })
})

describe('shortId', () => {
  it('should generate short IDs', () => {
    const id = shortId()
    expect(id.length).toBeLessThan(10)
  })

  it('should generate unique short IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(shortId())
    }
    expect(ids.size).toBe(100)
  })
})
