/**
 * Make an element draggable.
 */
export function makeDraggable(
  element: HTMLElement,
  handle: HTMLElement,
  options: {
    onDragStart?: (x: number, y: number) => void
    onDrag?: (x: number, y: number) => void
    onDragEnd?: (x: number, y: number) => void
    bounds?: { minX: number; maxX: number; minY: number; maxY: number }
  } = {}
): () => void {
  let isDragging = false
  let startX = 0
  let startY = 0
  let offsetX = 0
  let offsetY = 0

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return // Only left click

    isDragging = true
    startX = e.clientX
    startY = e.clientY

    const rect = element.getBoundingClientRect()
    offsetX = rect.left
    offsetY = rect.top

    handle.style.cursor = 'grabbing'

    options.onDragStart?.(offsetX, offsetY)

    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    let newX = offsetX + deltaX
    let newY = offsetY + deltaY

    // Apply bounds
    if (options.bounds) {
      newX = Math.max(options.bounds.minX, Math.min(newX, options.bounds.maxX))
      newY = Math.max(options.bounds.minY, Math.min(newY, options.bounds.maxY))
    }

    element.style.left = `${newX}px`
    element.style.top = `${newY}px`
    element.style.right = 'auto'
    element.style.bottom = 'auto'

    options.onDrag?.(newX, newY)
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    isDragging = false
    handle.style.cursor = 'move'

    const rect = element.getBoundingClientRect()
    options.onDragEnd?.(rect.left, rect.top)
  }

  handle.style.cursor = 'move'
  handle.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  return () => {
    handle.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

/**
 * Get initial position based on position option.
 */
export function getInitialPosition(
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  width: number,
  height: number
): { x: number; y: number } {
  const margin = 16

  switch (position) {
    case 'top-left':
      return { x: margin, y: margin }
    case 'top-right':
      return { x: window.innerWidth - width - margin, y: margin }
    case 'bottom-left':
      return { x: margin, y: window.innerHeight - height - margin }
    case 'bottom-right':
      return { x: window.innerWidth - width - margin, y: window.innerHeight - height - margin }
  }
}
