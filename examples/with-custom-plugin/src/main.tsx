import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactScopeProvider } from '@oxog/reactscope'
import { createAlertPlugin } from './plugins/alert-plugin'
import { createAnalyticsPlugin } from './plugins/analytics-plugin'
import App from './App'
import './index.css'

// Create custom plugins
const alertPlugin = createAlertPlugin({
  slowThreshold: 10, // Alert for renders > 10ms
  wastedThreshold: 2,
  enabled: true,
})

const analyticsPlugin = createAnalyticsPlugin()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactScopeProvider
      plugins={[alertPlugin, analyticsPlugin]}
      onReady={(kernel) => {
        console.log('ReactScope ready with custom plugins!')

        // Expose plugins globally for debugging
        const win = window as unknown as Record<string, unknown>
        win.__alertPlugin = kernel.getPlugin('alert-plugin')
        win.__analyticsPlugin = kernel.getPlugin('analytics-plugin')
      }}
    >
      <App />
    </ReactScopeProvider>
  </React.StrictMode>
)
