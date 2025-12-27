import { createPlugin, type Plugin } from '@oxog/reactscope'

interface AlertPluginOptions {
  slowThreshold?: number
  wastedThreshold?: number
  enabled?: boolean
}

interface AlertRecord {
  type: 'slow' | 'wasted'
  componentName: string
  value: number
  timestamp: number
}

/**
 * Custom plugin that alerts when components have performance issues
 */
export function createAlertPlugin(options: AlertPluginOptions = {}): Plugin {
  const {
    slowThreshold = 16,
    wastedThreshold = 3,
    enabled = true,
  } = options

  const alerts: AlertRecord[] = []
  let isEnabled = enabled

  return createPlugin({
    name: 'alert-plugin',
    version: '1.0.0',

    onInit: () => {
      console.log('[AlertPlugin] Initialized with options:', {
        slowThreshold,
        wastedThreshold,
      })
    },

    onDestroy: () => {
      console.log('[AlertPlugin] Destroyed')
    },

    hooks: {
      onRender: (event) => {
        if (!isEnabled) return

        // Check for slow renders
        if (event.duration > slowThreshold) {
          const alert: AlertRecord = {
            type: 'slow',
            componentName: event.componentName,
            value: event.duration,
            timestamp: Date.now(),
          }
          alerts.push(alert)

          console.warn(
            `[AlertPlugin] Slow render detected: ${event.componentName} took ${event.duration.toFixed(2)}ms`
          )
        }
      },

      onPropsChange: (event) => {
        if (!isEnabled) return

        // This is simplified - in real world you'd track wasted renders properly
        if (event.changes.length === 0) {
          console.info(
            `[AlertPlugin] Potential wasted render: ${event.componentName} - no props changed`
          )
        }
      },
    },

    api: {
      getAlerts: (): AlertRecord[] => [...alerts],

      getSlowAlerts: (): AlertRecord[] => alerts.filter((a) => a.type === 'slow'),

      getWastedAlerts: (): AlertRecord[] => alerts.filter((a) => a.type === 'wasted'),

      clearAlerts: (): void => {
        alerts.length = 0
      },

      enable: (): void => {
        isEnabled = true
      },

      disable: (): void => {
        isEnabled = false
      },

      isEnabled: (): boolean => isEnabled,
    },
  })
}
