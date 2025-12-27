import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  formatBytes,
  formatNumber,
  formatPercentage,
  formatTimestamp,
  formatRelativeTime,
} from '../../../src/utils/format'

describe('formatDuration', () => {
  it('should format microseconds', () => {
    expect(formatDuration(0.5)).toBe('500μs')
    expect(formatDuration(0.001)).toBe('1μs')
  })

  it('should format milliseconds', () => {
    expect(formatDuration(1)).toBe('1.00ms')
    expect(formatDuration(100.5)).toBe('100.50ms')
    expect(formatDuration(999)).toBe('999.00ms')
  })

  it('should format seconds', () => {
    expect(formatDuration(1000)).toBe('1.00s')
    expect(formatDuration(2500)).toBe('2.50s')
  })

  it('should format minutes', () => {
    expect(formatDuration(60000)).toBe('1m')
    expect(formatDuration(90000)).toBe('1m 30s')
  })

  it('should format hours', () => {
    expect(formatDuration(3600000)).toBe('1h')
    expect(formatDuration(5400000)).toBe('1h 30m')
  })

  it('should handle negative values', () => {
    expect(formatDuration(-100)).toBe('-100.00ms')
  })
})

describe('formatBytes', () => {
  it('should format bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(500)).toBe('500.00 B')
  })

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB')
    expect(formatBytes(1536)).toBe('1.50 KB')
  })

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB')
  })

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.00 GB')
  })

  it('should respect decimal places', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 1)).toBe('1.5 KB')
  })

  it('should handle negative values', () => {
    expect(formatBytes(-1024)).toBe('-1.00 KB')
  })
})

describe('formatNumber', () => {
  it('should format integers', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should format decimals', () => {
    expect(formatNumber(1234.56, 2)).toBe('1,234.56')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(123)).toBe('123')
  })

  it('should handle Infinity', () => {
    expect(formatNumber(Infinity)).toBe('Infinity')
  })

  it('should handle NaN', () => {
    expect(formatNumber(NaN)).toBe('NaN')
  })
})

describe('formatPercentage', () => {
  it('should format decimal to percentage', () => {
    expect(formatPercentage(0.5)).toBe('50.0%')
    expect(formatPercentage(0.123)).toBe('12.3%')
  })

  it('should format already percentage values', () => {
    expect(formatPercentage(50, 1, true)).toBe('50.0%')
  })

  it('should respect decimal places', () => {
    expect(formatPercentage(0.1234, 2)).toBe('12.34%')
  })
})

describe('formatTimestamp', () => {
  it('should format time only', () => {
    const timestamp = new Date('2024-01-15T14:30:45.123').getTime()
    const result = formatTimestamp(timestamp)
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)
  })

  it('should format with date', () => {
    const timestamp = new Date('2024-01-15T14:30:45.123').getTime()
    const result = formatTimestamp(timestamp, true)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/)
  })
})

describe('formatRelativeTime', () => {
  it('should format just now', () => {
    expect(formatRelativeTime(Date.now())).toBe('just now')
  })

  it('should format seconds ago', () => {
    expect(formatRelativeTime(Date.now() - 5000)).toBe('5 seconds ago')
    expect(formatRelativeTime(Date.now() - 1000)).toBe('1 second ago')
  })

  it('should format minutes ago', () => {
    expect(formatRelativeTime(Date.now() - 120000)).toBe('2 minutes ago')
  })

  it('should format hours ago', () => {
    expect(formatRelativeTime(Date.now() - 7200000)).toBe('2 hours ago')
  })

  it('should format future times', () => {
    expect(formatRelativeTime(Date.now() + 5000)).toBe('in 5 seconds')
  })
})
