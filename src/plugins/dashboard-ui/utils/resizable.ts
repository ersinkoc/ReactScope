/**
 * Make an element resizable.
 */
export function makeResizable(
  element: HTMLElement,
  options: {
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    onResize?: (width: number, height: number) => void
    onResizeEnd?: (width: number, height: number) => void
  } = {}
): () => void {
  const {
    minWidth = 200,
    minHeight = 150,
    maxWidth = window.innerWidth - 32,
    maxHeight = window.innerHeight - 32,
    onResize,
    onResizeEnd,
  } = options

  const cleanups: Array<() => void> = []

  // Create resize handles
  const handleSE = document.createElement('div')
  handleSE.className = 'resize-handle resize-handle-se'
  element.appendChild(handleSE)

  const handleE = document.createElement('div')
  handleE.className = 'resize-handle resize-handle-e'
  element.appendChild(handleE)

  const handleS = document.createElement('div')
  handleS.className = 'resize-handle resize-handle-s'
  element.appendChild(handleS)

  const createResizeHandler = (
    handle: HTMLElement,
    resizeWidth: boolean,
    resizeHeight: boolean
  ) => {
    let isResizing = false
    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return

      isResizing = true
      startX = e.clientX
      startY = e.clientY
      startWidth = element.offsetWidth
      startHeight = element.offsetHeight

      e.preventDefault()
      e.stopPropagation()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      let newWidth = startWidth
      let newHeight = startHeight

      if (resizeWidth) {
        newWidth = startWidth + (e.clientX - startX)
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
      }

      if (resizeHeight) {
        newHeight = startHeight + (e.clientY - startY)
        newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight))
      }

      element.style.width = `${newWidth}px`
      element.style.height = `${newHeight}px`

      onResize?.(newWidth, newHeight)
    }

    const onMouseUp = () => {
      if (!isResizing) return

      isResizing = false
      onResizeEnd?.(element.offsetWidth, element.offsetHeight)
    }

    handle.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    cleanups.push(() => {
      handle.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })
  }

  createResizeHandler(handleSE, true, true)
  createResizeHandler(handleE, true, false)
  createResizeHandler(handleS, false, true)

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
    handleSE.remove()
    handleE.remove()
    handleS.remove()
  }
}
