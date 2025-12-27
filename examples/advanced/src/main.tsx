import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  ReactScopeProvider,
  createDashboardUIPlugin,
  createConsoleReporterPlugin,
  createJsonExporterPlugin
} from '@oxog/reactscope'
import App from './App'
import './index.css'

// Create plugins
const dashboardPlugin = createDashboardUIPlugin({
  position: 'bottom-right',
  defaultOpen: false,
})

const consolePlugin = createConsoleReporterPlugin({
  logRenders: false, // Only log significant events
  logWasted: true,
  logSlow: true,
  slowThreshold: 16,
})

const jsonExporter = createJsonExporterPlugin({
  includeTimeline: true,
  pretty: true,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactScopeProvider
      plugins={[dashboardPlugin, consolePlugin, jsonExporter]}
      options={{
        trackAllComponents: false,
        sampleRate: 1,
        maxHistorySize: 500,
      }}
      onReady={(kernel) => {
        console.log('ReactScope ready with plugins:', kernel.getPlugins().map(p => p.name))

        // Expose export function globally for debugging
        ;(window as unknown as Record<string, unknown>).__exportMetrics = () => {
          const exporter = kernel.getPlugin('json-exporter')
          if (exporter?.api && typeof exporter.api === 'object' && 'export' in exporter.api) {
            return (exporter.api as { export: () => string }).export()
          }
          return null
        }
      }}
    >
      <App />
    </ReactScopeProvider>
  </React.StrictMode>
)
