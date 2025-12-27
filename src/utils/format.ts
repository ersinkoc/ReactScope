/**
 * Format a duration in milliseconds to a human-readable string.
 * @param ms Duration in milliseconds
 * @returns Formatted string (e.g., "1.23ms", "2.5s", "1m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 0) {
    return '-' + formatDuration(-ms)
  }

  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`
  }

  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`
  }

  const seconds = ms / 1000

  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds.toFixed(0)}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Format bytes to a human-readable string.
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string (e.g., "1.23 KB", "5.67 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return '0 B'
  }

  if (bytes < 0) {
    return '-' + formatBytes(-bytes, decimals)
  }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const index = Math.min(i, sizes.length - 1)

  const value = bytes / Math.pow(k, index)

  return `${value.toFixed(decimals)} ${sizes[index]}`
}

/**
 * Format a number with thousands separators.
 * @param num Number to format
 * @param decimals Number of decimal places
 * @returns Formatted string (e.g., "1,234,567.89")
 */
export function formatNumber(num: number, decimals = 0): string {
  if (!Number.isFinite(num)) {
    return String(num)
  }

  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  const integerPart = parts[0] ?? ''
  const decimalPart = parts[1]

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

/**
 * Format a value as a percentage.
 * @param value Value between 0 and 1 (or 0-100 if isAlreadyPercentage)
 * @param decimals Number of decimal places
 * @param isAlreadyPercentage Whether the value is already a percentage (0-100)
 * @returns Formatted string (e.g., "12.34%")
 */
export function formatPercentage(value: number, decimals = 1, isAlreadyPercentage = false): string {
  const percentage = isAlreadyPercentage ? value : value * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format a timestamp to a human-readable string.
 * @param timestamp Unix timestamp in milliseconds
 * @param includeDate Whether to include the date
 * @returns Formatted string (e.g., "14:30:45.123" or "2024-01-15 14:30:45")
 */
export function formatTimestamp(timestamp: number, includeDate = false): string {
  const date = new Date(timestamp)

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')

  const time = `${hours}:${minutes}:${seconds}.${milliseconds}`

  if (!includeDate) {
    return time
  }

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${time}`
}

/**
 * Format a relative time (e.g., "2 minutes ago", "in 5 seconds").
 * @param timestamp Unix timestamp in milliseconds
 * @param now Current time (defaults to Date.now())
 * @returns Formatted relative time string
 */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = timestamp - now
  const absDiff = Math.abs(diff)
  const isPast = diff < 0

  if (absDiff < 1000) {
    return 'just now'
  }

  if (absDiff < 60000) {
    const seconds = Math.floor(absDiff / 1000)
    const unit = seconds === 1 ? 'second' : 'seconds'
    return isPast ? `${seconds} ${unit} ago` : `in ${seconds} ${unit}`
  }

  if (absDiff < 3600000) {
    const minutes = Math.floor(absDiff / 60000)
    const unit = minutes === 1 ? 'minute' : 'minutes'
    return isPast ? `${minutes} ${unit} ago` : `in ${minutes} ${unit}`
  }

  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000)
    const unit = hours === 1 ? 'hour' : 'hours'
    return isPast ? `${hours} ${unit} ago` : `in ${hours} ${unit}`
  }

  const days = Math.floor(absDiff / 86400000)
  const unit = days === 1 ? 'day' : 'days'
  return isPast ? `${days} ${unit} ago` : `in ${days} ${unit}`
}
