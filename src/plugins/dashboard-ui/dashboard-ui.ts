import type {
  Kernel,
  Plugin,
  DashboardOptions,
  DashboardState,
  DashboardPosition,
  DashboardTheme,
  TreeNode,
} from '../../types'
import { createShadowContainer, removeShadowContainer, createElement } from './utils/shadow-dom'
import { makeDraggable, getInitialPosition } from './utils/draggable'
import { makeResizable } from './utils/resizable'
import { formatDuration } from '../../utils/format'
import { throttle } from '../../utils/throttle'

export interface DashboardUIAPI {
  [key: string]: unknown
  show(): void
  hide(): void
  toggle(): void
  isVisible(): boolean
  setPosition(position: DashboardPosition): void
  setTheme(theme: DashboardTheme): void
  expand(): void
  collapse(): void
  isCollapsed(): boolean
  focusSearch(): void
  selectComponent(componentId: string): void
  refresh(): void
}

const DEFAULT_OPTIONS: Required<DashboardOptions> = {
  position: 'bottom-right',
  shortcut: 'ctrl+shift+r',
  draggable: true,
  resizable: true,
  defaultWidth: 400,
  defaultHeight: 500,
  defaultCollapsed: false,
  theme: 'dark',
}

/**
 * Dashboard UI Plugin
 * Provides a visual overlay panel with component tree and metrics.
 */
export class DashboardUIPlugin implements Plugin {
  readonly name = 'dashboard-ui'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private options: Required<DashboardOptions>
  private state: DashboardState
  private host: HTMLDivElement | null = null
  private root: HTMLDivElement | null = null
  private dashboard: HTMLDivElement | null = null
  private cleanups: Array<() => void> = []
  private updateThrottled: ReturnType<typeof throttle> | null = null

  constructor(options: DashboardOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.state = {
      isVisible: false,
      isCollapsed: this.options.defaultCollapsed,
      position: this.options.position,
      width: this.options.defaultWidth,
      height: this.options.defaultHeight,
      x: 0,
      y: 0,
      theme: this.options.theme,
      selectedComponentId: null,
      searchQuery: '',
      activeTab: 'tree',
    }
  }

  readonly api: DashboardUIAPI = {
    show: () => this.show(),
    hide: () => this.hide(),
    toggle: () => this.toggle(),
    isVisible: () => this.state.isVisible,
    setPosition: (position: DashboardPosition) => this.setPosition(position),
    setTheme: (theme: DashboardTheme) => this.setTheme(theme),
    expand: () => this.expand(),
    collapse: () => this.collapse(),
    isCollapsed: () => this.state.isCollapsed,
    focusSearch: () => this.focusSearch(),
    selectComponent: (id: string) => this.selectComponent(id),
    refresh: () => this.render(),
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
    this.setupKeyboardShortcut()
    this.setupEventListeners()
    this.updateThrottled = throttle(() => this.render(), 100)
  }

  uninstall(): void {
    this.hide()
    this.cleanup()
    this.kernel = null
  }

  private cleanup(): void {
    for (const cleanup of this.cleanups) {
      cleanup()
    }
    this.cleanups = []

    if (this.host) {
      removeShadowContainer(this.host)
      this.host = null
      this.root = null
      this.dashboard = null
    }
  }

  private setupKeyboardShortcut(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = this.options.shortcut.toLowerCase()
      const parts = shortcut.split('+')

      const ctrlRequired = parts.includes('ctrl')
      const shiftRequired = parts.includes('shift')
      const altRequired = parts.includes('alt')
      const key = parts.find((p) => !['ctrl', 'shift', 'alt'].includes(p)) ?? ''

      if (
        e.ctrlKey === ctrlRequired &&
        e.shiftKey === shiftRequired &&
        e.altKey === altRequired &&
        e.key.toLowerCase() === key
      ) {
        e.preventDefault()
        this.toggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    this.cleanups.push(() => document.removeEventListener('keydown', handleKeyDown))
  }

  private setupEventListeners(): void {
    if (!this.kernel) return

    const unsubscribe = this.kernel.on('metrics-update', () => {
      if (this.state.isVisible && this.updateThrottled) {
        this.updateThrottled()
      }
    })

    this.cleanups.push(unsubscribe)
  }

  private show(): void {
    if (this.state.isVisible) return

    this.state.isVisible = true
    this.createDashboard()
    this.render()
  }

  private hide(): void {
    if (!this.state.isVisible) return

    this.state.isVisible = false

    if (this.host) {
      removeShadowContainer(this.host)
      this.host = null
      this.root = null
      this.dashboard = null
    }
  }

  private toggle(): void {
    if (this.state.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  private setPosition(position: DashboardPosition): void {
    this.state.position = position
    const pos = getInitialPosition(position, this.state.width, this.state.height)
    this.state.x = pos.x
    this.state.y = pos.y

    if (this.dashboard) {
      this.dashboard.style.left = `${pos.x}px`
      this.dashboard.style.top = `${pos.y}px`
    }
  }

  private setTheme(theme: DashboardTheme): void {
    this.state.theme = theme
  }

  private expand(): void {
    this.state.isCollapsed = false
    if (this.dashboard) {
      this.dashboard.classList.remove('collapsed')
    }
  }

  private collapse(): void {
    this.state.isCollapsed = true
    if (this.dashboard) {
      this.dashboard.classList.add('collapsed')
    }
  }

  private focusSearch(): void {
    if (this.root) {
      const searchInput = this.root.querySelector('.search-input') as HTMLInputElement
      searchInput?.focus()
    }
  }

  private selectComponent(componentId: string): void {
    this.state.selectedComponentId = componentId
    this.render()
  }

  private createDashboard(): void {
    const { host, root } = createShadowContainer()
    this.host = host
    this.root = root

    const pos = getInitialPosition(this.state.position, this.state.width, this.state.height)
    this.state.x = pos.x
    this.state.y = pos.y

    this.dashboard = createElement('div', 'dashboard')
    this.dashboard.style.width = `${this.state.width}px`
    this.dashboard.style.height = `${this.state.height}px`
    this.dashboard.style.left = `${pos.x}px`
    this.dashboard.style.top = `${pos.y}px`

    if (this.state.isCollapsed) {
      this.dashboard.classList.add('collapsed')
    }

    root.appendChild(this.dashboard)

    if (this.options.resizable) {
      const cleanupResize = makeResizable(this.dashboard, {
        minWidth: 300,
        minHeight: 200,
        onResizeEnd: (width, height) => {
          this.state.width = width
          this.state.height = height
        },
      })
      this.cleanups.push(cleanupResize)
    }
  }

  private render(): void {
    if (!this.dashboard || !this.kernel) return

    // Clear existing content
    while (this.dashboard.firstChild) {
      this.dashboard.removeChild(this.dashboard.firstChild)
    }

    const header = this.renderHeader()
    this.dashboard.appendChild(header)

    if (this.options.draggable) {
      const cleanupDrag = makeDraggable(this.dashboard, header, {
        onDragEnd: (x, y) => {
          this.state.x = x
          this.state.y = y
        },
      })
      this.cleanups.push(cleanupDrag)
    }

    if (!this.state.isCollapsed) {
      const content = this.renderContent()
      this.dashboard.appendChild(content)
    }
  }

  private renderHeader(): HTMLDivElement {
    const header = createElement('div', 'dashboard-header')

    const title = createElement('div', 'dashboard-title')
    const icon = createElement('span', 'dashboard-title-icon')
    icon.textContent = '\u26A1'
    const text = createElement('span')
    text.textContent = 'ReactScope'
    title.appendChild(icon)
    title.appendChild(text)
    header.appendChild(title)

    const controls = createElement('div', 'dashboard-controls')

    const collapseBtn = createElement('button', 'dashboard-btn')
    collapseBtn.textContent = this.state.isCollapsed ? '\u25A2' : '\u2581'
    collapseBtn.title = this.state.isCollapsed ? 'Expand' : 'Collapse'
    collapseBtn.onclick = () => {
      if (this.state.isCollapsed) {
        this.expand()
      } else {
        this.collapse()
      }
      this.render()
    }
    controls.appendChild(collapseBtn)

    const closeBtn = createElement('button', 'dashboard-btn')
    closeBtn.textContent = '\u2715'
    closeBtn.title = 'Close'
    closeBtn.onclick = () => this.hide()
    controls.appendChild(closeBtn)

    header.appendChild(controls)

    return header
  }

  private renderContent(): HTMLDivElement {
    const content = createElement('div', 'dashboard-content')

    const tabs = this.renderTabs()
    content.appendChild(tabs)

    const panel = this.renderPanel()
    content.appendChild(panel)

    return content
  }

  private renderTabs(): HTMLDivElement {
    const tabs = createElement('div', 'dashboard-tabs')

    const tabItems = [
      { id: 'tree', label: 'Tree' },
      { id: 'alerts', label: 'Alerts' },
      { id: 'details', label: 'Details' },
    ]

    for (const item of tabItems) {
      const tab = createElement('button', 'dashboard-tab')
      tab.textContent = item.label
      if (this.state.activeTab === item.id) {
        tab.classList.add('active')
      }
      tab.onclick = () => {
        this.state.activeTab = item.id
        this.render()
      }
      tabs.appendChild(tab)
    }

    return tabs
  }

  private renderPanel(): HTMLDivElement {
    const panel = createElement('div', 'dashboard-panel')

    switch (this.state.activeTab) {
      case 'tree':
        this.renderTreePanel(panel)
        break
      case 'alerts':
        this.renderAlertsPanel(panel)
        break
      case 'details':
        this.renderDetailsPanel(panel)
        break
    }

    return panel
  }

  private renderTreePanel(panel: HTMLDivElement): void {
    const searchInput = createElement('input', 'search-input') as HTMLInputElement
    searchInput.type = 'text'
    searchInput.placeholder = 'Search components...'
    searchInput.value = this.state.searchQuery
    searchInput.oninput = (e) => {
      this.state.searchQuery = (e.target as HTMLInputElement).value
      this.render()
    }
    panel.appendChild(searchInput)

    const treeView = createElement('div', 'tree-view')
    const tree = this.kernel?.getMetrics().getTree()

    if (tree?.root) {
      this.renderTreeNode(treeView, tree.root)
    } else {
      const empty = this.createEmptyState('\uD83D\uDCCA', 'No components tracked yet')
      treeView.appendChild(empty)
    }

    panel.appendChild(treeView)
  }

  private renderTreeNode(container: HTMLElement, node: TreeNode): void {
    const query = this.state.searchQuery.toLowerCase()
    const matchesSearch = !query || node.name.toLowerCase().includes(query)

    const hasMatchingChildren = node.children.some((child) =>
      this.nodeMatchesSearch(child, query)
    )

    if (!matchesSearch && !hasMatchingChildren) {
      return
    }

    const nodeEl = createElement('div', 'tree-node')
    const contentEl = createElement('div', 'tree-node-content')

    if (this.state.selectedComponentId === node.id) {
      contentEl.classList.add('selected')
    }

    contentEl.onclick = () => {
      this.state.selectedComponentId = node.id
      this.state.activeTab = 'details'
      this.render()
    }

    if (node.children.length > 0) {
      const toggle = createElement('span', 'tree-node-toggle')
      toggle.textContent = node.isExpanded ? '\u25BC' : '\u25B6'
      toggle.onclick = (e) => {
        e.stopPropagation()
        node.isExpanded = !node.isExpanded
        this.render()
      }
      contentEl.appendChild(toggle)
    } else {
      const spacer = createElement('span', 'tree-node-toggle')
      contentEl.appendChild(spacer)
    }

    const name = createElement('span', 'tree-node-name')
    name.textContent = node.name
    contentEl.appendChild(name)

    if (node.metrics) {
      const metrics = createElement('span', 'tree-node-metrics')

      const rendersBadge = createElement('span', 'metric-badge renders')
      rendersBadge.textContent = String(node.metrics.renderCount)
      metrics.appendChild(rendersBadge)

      const timeBadge = createElement('span', `metric-badge time${node.metrics.averageRenderTime > 16 ? ' slow' : ''}`)
      timeBadge.textContent = formatDuration(node.metrics.averageRenderTime)
      metrics.appendChild(timeBadge)

      if (node.metrics.wastedRenderCount > 0) {
        const wastedBadge = createElement('span', 'metric-badge wasted')
        wastedBadge.textContent = `\u26A0\uFE0F ${node.metrics.wastedRenderCount}`
        metrics.appendChild(wastedBadge)
      }

      contentEl.appendChild(metrics)
    }

    nodeEl.appendChild(contentEl)

    if (node.isExpanded && node.children.length > 0) {
      const childrenEl = createElement('div', 'tree-node-children')
      for (const child of node.children) {
        this.renderTreeNode(childrenEl, child)
      }
      nodeEl.appendChild(childrenEl)
    }

    container.appendChild(nodeEl)
  }

  private nodeMatchesSearch(node: TreeNode, query: string): boolean {
    if (!query) return true
    if (node.name.toLowerCase().includes(query)) return true
    return node.children.some((child) => this.nodeMatchesSearch(child, query))
  }

  private renderAlertsPanel(panel: HTMLDivElement): void {
    const allMetrics = this.kernel?.getMetrics().getAll()

    if (!allMetrics || allMetrics.size === 0) {
      const empty = this.createEmptyState('\u2713', 'No alerts')
      panel.appendChild(empty)
      return
    }

    const alerts: Array<{ type: 'warning' | 'error'; title: string; description: string }> = []

    for (const metrics of allMetrics.values()) {
      if (metrics.averageRenderTime > 16) {
        alerts.push({
          type: 'error',
          title: `${metrics.componentName} is slow`,
          description: `Average render time: ${formatDuration(metrics.averageRenderTime)}`,
        })
      }

      if (metrics.wastedRenderCount > 0 && metrics.renderCount > 0) {
        const percentage = ((metrics.wastedRenderCount / metrics.renderCount) * 100).toFixed(0)
        if (parseInt(percentage) > 30) {
          alerts.push({
            type: 'warning',
            title: `${metrics.componentName} has wasted renders`,
            description: `${metrics.wastedRenderCount} wasted renders (${percentage}%)`,
          })
        }
      }
    }

    if (alerts.length === 0) {
      const empty = this.createEmptyState('\u2713', 'No alerts - everything looks good!')
      panel.appendChild(empty)
      return
    }

    for (const alert of alerts) {
      const alertEl = createElement('div', 'alert-item')

      const icon = createElement('span', `alert-icon ${alert.type}`)
      icon.textContent = alert.type === 'warning' ? '\u26A0\uFE0F' : '\uD83D\uDD34'
      alertEl.appendChild(icon)

      const content = createElement('div', 'alert-content')
      const title = createElement('div', 'alert-title')
      title.textContent = alert.title
      const description = createElement('div', 'alert-description')
      description.textContent = alert.description
      content.appendChild(title)
      content.appendChild(description)
      alertEl.appendChild(content)

      panel.appendChild(alertEl)
    }
  }

  private renderDetailsPanel(panel: HTMLDivElement): void {
    const componentId = this.state.selectedComponentId
    if (!componentId) {
      const empty = this.createEmptyState('\uD83D\uDC46', 'Select a component to view details')
      panel.appendChild(empty)
      return
    }

    const metrics = this.kernel?.getMetrics().get(componentId)
    if (!metrics) {
      const empty = this.createEmptyState('\u2753', 'Component not found')
      panel.appendChild(empty)
      return
    }

    const details = createElement('div', 'details-panel')

    const infoSection = createElement('div', 'details-section')
    const infoTitle = createElement('div', 'details-section-title')
    infoTitle.textContent = 'Component'
    infoSection.appendChild(infoTitle)
    infoSection.appendChild(this.createRow('Name', metrics.componentName))
    infoSection.appendChild(this.createRow('ID', metrics.componentId))
    infoSection.appendChild(this.createRow('Status', metrics.isCurrentlyMounted ? '\uD83D\uDFE2 Mounted' : '\uD83D\uDD34 Unmounted'))
    details.appendChild(infoSection)

    const renderSection = createElement('div', 'details-section')
    const renderTitle = createElement('div', 'details-section-title')
    renderTitle.textContent = 'Renders'
    renderSection.appendChild(renderTitle)
    renderSection.appendChild(this.createRow('Count', metrics.renderCount.toString()))
    renderSection.appendChild(this.createRow('Average Time', formatDuration(metrics.averageRenderTime)))
    renderSection.appendChild(this.createRow('Total Time', formatDuration(metrics.totalRenderTime)))
    renderSection.appendChild(this.createRow('Last Render', formatDuration(metrics.lastRenderTime)))
    renderSection.appendChild(this.createRow('Wasted Renders', metrics.wastedRenderCount.toString()))
    details.appendChild(renderSection)

    const lifecycleSection = createElement('div', 'details-section')
    const lifecycleTitle = createElement('div', 'details-section-title')
    lifecycleTitle.textContent = 'Lifecycle'
    lifecycleSection.appendChild(lifecycleTitle)
    lifecycleSection.appendChild(this.createRow('Mount Count', metrics.mountCount.toString()))
    lifecycleSection.appendChild(this.createRow('Props Changes', metrics.propsChangeCount.toString()))
    details.appendChild(lifecycleSection)

    panel.appendChild(details)
  }

  private createEmptyState(iconText: string, message: string): HTMLDivElement {
    const empty = createElement('div', 'empty-state')
    const icon = createElement('div', 'empty-state-icon')
    icon.textContent = iconText
    const text = createElement('div')
    text.textContent = message
    empty.appendChild(icon)
    empty.appendChild(text)
    return empty
  }

  private createRow(label: string, value: string): HTMLDivElement {
    const row = createElement('div', 'details-row')
    const labelEl = createElement('span', 'details-label')
    labelEl.textContent = label
    const valueEl = createElement('span', 'details-value')
    valueEl.textContent = value
    row.appendChild(labelEl)
    row.appendChild(valueEl)
    return row
  }
}

/**
 * Create a new dashboard UI plugin instance.
 */
export function createDashboardUIPlugin(options?: DashboardOptions): DashboardUIPlugin {
  return new DashboardUIPlugin(options)
}
