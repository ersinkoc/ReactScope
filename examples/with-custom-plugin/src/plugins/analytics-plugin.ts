import { createPlugin, type Plugin, type Kernel } from '@oxog/reactscope'

interface AnalyticsEvent {
  type: string
  componentName: string
  data: Record<string, unknown>
  timestamp: number
}

interface ComponentStats {
  totalRenders: number
  totalDuration: number
  mountCount: number
  unmountCount: number
}

/**
 * Custom analytics plugin that tracks detailed component statistics
 */
export function createAnalyticsPlugin(): Plugin {
  const events: AnalyticsEvent[] = []
  const componentStats = new Map<string, ComponentStats>()
  let kernelRef: Kernel | null = null

  const getOrCreateStats = (componentName: string): ComponentStats => {
    let stats = componentStats.get(componentName)
    if (!stats) {
      stats = {
        totalRenders: 0,
        totalDuration: 0,
        mountCount: 0,
        unmountCount: 0,
      }
      componentStats.set(componentName, stats)
    }
    return stats
  }

  return createPlugin({
    name: 'analytics-plugin',
    version: '1.0.0',

    onInit: (kernel) => {
      kernelRef = kernel
      console.log('[AnalyticsPlugin] Tracking started')
    },

    onDestroy: () => {
      kernelRef = null
      console.log('[AnalyticsPlugin] Tracking stopped')
    },

    hooks: {
      onRender: (event) => {
        const stats = getOrCreateStats(event.componentName)
        stats.totalRenders++
        stats.totalDuration += event.duration

        events.push({
          type: 'render',
          componentName: event.componentName,
          data: {
            duration: event.duration,
            phase: event.phase,
          },
          timestamp: Date.now(),
        })
      },

      onMount: (event) => {
        const stats = getOrCreateStats(event.componentName)
        stats.mountCount++

        events.push({
          type: 'mount',
          componentName: event.componentName,
          data: {},
          timestamp: Date.now(),
        })
      },

      onUnmount: (event) => {
        const stats = getOrCreateStats(event.componentName)
        stats.unmountCount++

        events.push({
          type: 'unmount',
          componentName: event.componentName,
          data: {},
          timestamp: Date.now(),
        })
      },
    },

    api: {
      getEvents: (): AnalyticsEvent[] => [...events],

      getEventsByType: (type: string): AnalyticsEvent[] =>
        events.filter((e) => e.type === type),

      getEventsByComponent: (componentName: string): AnalyticsEvent[] =>
        events.filter((e) => e.componentName === componentName),

      getComponentStats: (componentName: string): ComponentStats | undefined =>
        componentStats.get(componentName),

      getAllStats: (): Map<string, ComponentStats> => new Map(componentStats),

      getSummary: () => {
        let totalRenders = 0
        let totalDuration = 0
        let totalMounts = 0
        let totalUnmounts = 0

        componentStats.forEach((stats) => {
          totalRenders += stats.totalRenders
          totalDuration += stats.totalDuration
          totalMounts += stats.mountCount
          totalUnmounts += stats.unmountCount
        })

        return {
          componentCount: componentStats.size,
          totalRenders,
          totalDuration,
          averageDuration: totalRenders > 0 ? totalDuration / totalRenders : 0,
          totalMounts,
          totalUnmounts,
          eventCount: events.length,
        }
      },

      clear: (): void => {
        events.length = 0
        componentStats.clear()
      },

      export: (): string => {
        return JSON.stringify(
          {
            events,
            stats: Object.fromEntries(componentStats),
            summary: (
              createAnalyticsPlugin().api as {
                getSummary: () => unknown
              }
            ).getSummary(),
          },
          null,
          2
        )
      },
    },
  })
}
