import { DASHBOARD_CSS } from '../styles/dashboard.css'

/**
 * Create a Shadow DOM container for the dashboard.
 */
export function createShadowContainer(): {
  host: HTMLDivElement
  shadow: ShadowRoot
  root: HTMLDivElement
} {
  // Create host element
  const host = document.createElement('div')
  host.id = 'reactscope-dashboard-host'
  host.style.cssText = 'position: fixed; z-index: 99999; pointer-events: none;'

  // Attach shadow DOM
  const shadow = host.attachShadow({ mode: 'open' })

  // Inject styles
  const style = document.createElement('style')
  style.textContent = DASHBOARD_CSS
  shadow.appendChild(style)

  // Create root container
  const root = document.createElement('div')
  root.id = 'reactscope-dashboard-root'
  root.style.cssText = 'pointer-events: auto;'
  shadow.appendChild(root)

  // Append to document
  document.body.appendChild(host)

  return { host, shadow, root }
}

/**
 * Remove the Shadow DOM container.
 */
export function removeShadowContainer(host: HTMLElement): void {
  if (host.parentNode) {
    host.parentNode.removeChild(host)
  }
}

/**
 * Create an element inside the shadow root.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (className) {
    el.className = className
  }
  if (textContent) {
    el.textContent = textContent
  }
  return el
}

/**
 * Set multiple attributes on an element.
 */
export function setAttributes(
  element: HTMLElement,
  attributes: Record<string, string>
): void {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
}

/**
 * Add event listener with automatic cleanup.
 */
export function addEventListenerWithCleanup(
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler, options)
  return () => element.removeEventListener(event, handler, options)
}
