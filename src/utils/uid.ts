/**
 * Counter for ensuring uniqueness within the same millisecond
 */
let counter = 0

/**
 * Last timestamp used for ID generation
 */
let lastTimestamp = 0

/**
 * Generate a unique ID.
 * Format: timestamp-random where timestamp is base36 encoded.
 */
export function uid(): string {
  const now = Date.now()

  // Reset counter if we're in a new millisecond
  if (now !== lastTimestamp) {
    counter = 0
    lastTimestamp = now
  } else {
    counter++
  }

  const timestamp = now.toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const suffix = counter > 0 ? `-${counter.toString(36)}` : ''

  return `${timestamp}-${random}${suffix}`
}

/**
 * Create an ID generator with an optional prefix.
 * Each call returns a new unique ID.
 */
export function createIdGenerator(prefix = ''): () => string {
  let localCounter = 0

  return (): string => {
    localCounter++
    const base = uid()
    return prefix ? `${prefix}-${base}` : base
  }
}

/**
 * Generate a short unique ID (shorter but less collision resistant).
 * Useful for component display names.
 */
export function shortId(): string {
  return Math.random().toString(36).substring(2, 9)
}
