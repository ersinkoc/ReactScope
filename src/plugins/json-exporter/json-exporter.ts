import type {
  Kernel,
  Plugin,
  ExportSummary,
  ComponentSummary,
  SerializableMetrics,
  SerializableTreeNode,
  ComponentMetrics,
  TreeNode,
} from '../../types'

export interface JSONExporterAPI {
  [key: string]: unknown
  exportAll(): string
  exportComponent(componentId: string): string
  exportSummary(): ExportSummary
  downloadJSON(filename?: string): void
  getSerializableMetrics(): SerializableMetrics
  exportToClipboard(): Promise<void>
}

/**
 * JSON Exporter Plugin
 * Exports metrics as JSON for CI/CD integration.
 */
export class JSONExporterPlugin implements Plugin {
  readonly name = 'json-exporter'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null

  readonly api: JSONExporterAPI = {
    exportAll: () => {
      return JSON.stringify(this.getSerializableMetrics(), null, 2)
    },

    exportComponent: (componentId: string) => {
      const metrics = this.kernel?.getMetrics().get(componentId)
      if (!metrics) {
        return JSON.stringify({ error: 'Component not found' })
      }
      return JSON.stringify(this.serializeMetrics(metrics), null, 2)
    },

    exportSummary: () => {
      return this.generateSummary()
    },

    downloadJSON: (filename?: string) => {
      this.download(filename)
    },

    getSerializableMetrics: () => {
      return this.getSerializableMetrics()
    },

    exportToClipboard: async () => {
      const json = this.api.exportAll()
      await navigator.clipboard.writeText(json)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
  }

  uninstall(): void {
    this.kernel = null
  }

  private getSerializableMetrics(): SerializableMetrics {
    if (!this.kernel) {
      return {
        components: [],
        tree: { root: null },
        timeline: [],
        session: { start: 0, end: 0, duration: 0 },
      }
    }

    const metricsStore = this.kernel.getMetrics()
    const allMetrics = metricsStore.getAll()
    const tree = metricsStore.getTree()

    const components = Array.from(allMetrics.entries()).map(([id, metrics]) => ({
      id,
      name: metrics.componentName,
      metrics: this.serializeMetrics(metrics),
    }))

    const serializableTree = this.serializeTree(tree.root)

    return {
      components,
      tree: { root: serializableTree },
      timeline: metricsStore.getTimeline(),
      session: {
        start: metricsStore.getSessionStart(),
        end: Date.now(),
        duration: metricsStore.getSessionDuration(),
      },
    }
  }

  private serializeMetrics(metrics: ComponentMetrics): ComponentMetrics {
    return {
      ...metrics,
      renderHistory: [...metrics.renderHistory],
      childIds: [...metrics.childIds],
    }
  }

  private serializeTree(node: TreeNode | null): SerializableTreeNode | null {
    if (!node) return null

    return {
      id: node.id,
      name: node.name,
      children: node.children.map((child) => this.serializeTree(child)).filter(Boolean) as SerializableTreeNode[],
      depth: node.depth,
    }
  }

  private generateSummary(): ExportSummary {
    if (!this.kernel) {
      return {
        totalComponents: 0,
        totalRenders: 0,
        totalWastedRenders: 0,
        averageRenderTime: 0,
        slowestComponents: [],
        mostWastedComponents: [],
        timestamp: new Date().toISOString(),
        duration: 0,
      }
    }

    const metricsStore = this.kernel.getMetrics()
    const allMetrics = Array.from(metricsStore.getAll().values())

    let totalRenders = 0
    let totalWastedRenders = 0
    let totalRenderTime = 0

    const componentStats: ComponentSummary[] = []

    for (const metrics of allMetrics) {
      totalRenders += metrics.renderCount
      totalWastedRenders += metrics.wastedRenderCount
      totalRenderTime += metrics.totalRenderTime

      componentStats.push({
        componentId: metrics.componentId,
        componentName: metrics.componentName,
        renderCount: metrics.renderCount,
        averageRenderTime: metrics.averageRenderTime,
        wastedRenderCount: metrics.wastedRenderCount,
      })
    }

    const slowestComponents = [...componentStats]
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, 10)

    const mostWastedComponents = [...componentStats]
      .sort((a, b) => b.wastedRenderCount - a.wastedRenderCount)
      .slice(0, 10)

    return {
      totalComponents: allMetrics.length,
      totalRenders,
      totalWastedRenders,
      averageRenderTime: totalRenders > 0 ? totalRenderTime / totalRenders : 0,
      slowestComponents,
      mostWastedComponents,
      timestamp: new Date().toISOString(),
      duration: metricsStore.getSessionDuration(),
    }
  }

  private download(filename?: string): void {
    const json = this.api.exportAll()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const name = filename ?? `reactscope-export-${Date.now()}.json`

    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()

    URL.revokeObjectURL(url)
  }
}

/**
 * Create a new JSON exporter plugin instance.
 */
export function createJSONExporterPlugin(): JSONExporterPlugin {
  return new JSONExporterPlugin()
}
