import React from 'react'
import { useScope, useScopeContext } from '@oxog/reactscope'

interface AlertRecord {
  type: string
  componentName: string
  value: number
  timestamp: number
}

interface AnalyticsSummary {
  componentCount: number
  totalRenders: number
  totalDuration: number
  averageDuration: number
  totalMounts: number
  totalUnmounts: number
  eventCount: number
}

function App() {
  return (
    <div className="app">
      <header>
        <h1>Custom Plugin Example</h1>
        <p>Demonstrates creating and using custom ReactScope plugins</p>
      </header>

      <main>
        <div className="grid">
          <PluginControls />
          <DemoComponents />
        </div>

        <PluginStats />
      </main>
    </div>
  )
}

function PluginControls() {
  const kernel = useScopeContext()
  const [alertEnabled, setAlertEnabled] = React.useState(true)

  const alertPlugin = kernel.getPlugin('alert-plugin')
  const analyticsPlugin = kernel.getPlugin('analytics-plugin')

  const toggleAlerts = () => {
    if (alertPlugin?.api) {
      const api = alertPlugin.api as {
        isEnabled: () => boolean
        enable: () => void
        disable: () => void
      }
      if (api.isEnabled()) {
        api.disable()
        setAlertEnabled(false)
      } else {
        api.enable()
        setAlertEnabled(true)
      }
    }
  }

  const clearAll = () => {
    if (alertPlugin?.api) {
      (alertPlugin.api as { clearAlerts: () => void }).clearAlerts()
    }
    if (analyticsPlugin?.api) {
      (analyticsPlugin.api as { clear: () => void }).clear()
    }
  }

  const exportData = () => {
    if (analyticsPlugin?.api) {
      const data = (analyticsPlugin.api as { export: () => string }).export()
      console.log('Exported analytics data:', data)
      alert('Data exported to console!')
    }
  }

  return (
    <div className="card">
      <h2>Plugin Controls</h2>
      <div className="controls">
        <button onClick={toggleAlerts}>
          {alertEnabled ? 'Disable' : 'Enable'} Alerts
        </button>
        <button onClick={clearAll}>Clear All Data</button>
        <button onClick={exportData}>Export Analytics</button>
      </div>
      <div className="status">
        <span className={alertEnabled ? 'active' : 'inactive'}>
          Alerts: {alertEnabled ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}

function DemoComponents() {
  const scope = useScope('DemoComponents')
  const [showSlow, setShowSlow] = React.useState(false)
  const [showMany, setShowMany] = React.useState(false)

  return (
    <div className="card">
      <h2>Demo Components</h2>
      <p className="hint">
        Interact with these to trigger plugin events
      </p>

      <div className="controls">
        <button onClick={() => setShowSlow(!showSlow)}>
          {showSlow ? 'Hide' : 'Show'} Slow Component
        </button>
        <button onClick={() => setShowMany(!showMany)}>
          {showMany ? 'Hide' : 'Show'} Many Items
        </button>
      </div>

      {showSlow && <SlowComponent />}
      {showMany && <ManyItems />}

      <div className="metrics">
        <span>Renders: {scope.renderCount}</span>
      </div>
    </div>
  )
}

function SlowComponent() {
  const scope = useScope('SlowComponent')

  // Simulate slow render
  const start = performance.now()
  while (performance.now() - start < 20) {
    // Block for 20ms
  }

  return (
    <div className="slow-component">
      <h3>Slow Component</h3>
      <p>This component intentionally takes 20ms to render</p>
      <div className="metrics">
        <span>Renders: {scope.renderCount}</span>
        <span>Last: {scope.lastRenderTime.toFixed(2)}ms</span>
      </div>
    </div>
  )
}

function ManyItems() {
  const scope = useScope('ManyItems')
  const [items, setItems] = React.useState<number[]>([1, 2, 3])

  return (
    <div className="many-items">
      <h3>Many Items ({items.length})</h3>
      <button onClick={() => setItems([...items, items.length + 1])}>
        Add Item
      </button>
      <ul>
        {items.map((item) => (
          <ItemComponent key={item} value={item} />
        ))}
      </ul>
      <div className="metrics">
        <span>Renders: {scope.renderCount}</span>
      </div>
    </div>
  )
}

function ItemComponent({ value }: { value: number }) {
  const scope = useScope(`Item-${value}`)

  return (
    <li>
      Item {value} (renders: {scope.renderCount})
    </li>
  )
}

function PluginStats() {
  const kernel = useScopeContext()
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  // Refresh stats every second
  React.useEffect(() => {
    const interval = setInterval(forceUpdate, 1000)
    return () => clearInterval(interval)
  }, [])

  const alertPlugin = kernel.getPlugin('alert-plugin')
  const analyticsPlugin = kernel.getPlugin('analytics-plugin')

  const alerts = alertPlugin?.api
    ? (alertPlugin.api as { getAlerts: () => AlertRecord[] }).getAlerts()
    : []

  const summary = analyticsPlugin?.api
    ? (analyticsPlugin.api as { getSummary: () => AnalyticsSummary }).getSummary()
    : null

  return (
    <div className="stats-section">
      <div className="card">
        <h2>Alert Plugin</h2>
        <p className="hint">Shows performance alerts</p>
        {alerts.length === 0 ? (
          <p className="empty">No alerts yet</p>
        ) : (
          <ul className="alert-list">
            {alerts.slice(-5).map((alert, i) => (
              <li key={i} className={`alert-${alert.type}`}>
                <span className="alert-type">{alert.type}</span>
                <span className="alert-component">{alert.componentName}</span>
                <span className="alert-value">{alert.value.toFixed(2)}ms</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Analytics Plugin</h2>
        <p className="hint">Detailed performance statistics</p>
        {summary ? (
          <dl className="stats-grid">
            <div>
              <dt>Components</dt>
              <dd>{summary.componentCount}</dd>
            </div>
            <div>
              <dt>Total Renders</dt>
              <dd>{summary.totalRenders}</dd>
            </div>
            <div>
              <dt>Avg Duration</dt>
              <dd>{summary.averageDuration.toFixed(2)}ms</dd>
            </div>
            <div>
              <dt>Mounts</dt>
              <dd>{summary.totalMounts}</dd>
            </div>
            <div>
              <dt>Unmounts</dt>
              <dd>{summary.totalUnmounts}</dd>
            </div>
            <div>
              <dt>Events</dt>
              <dd>{summary.eventCount}</dd>
            </div>
          </dl>
        ) : (
          <p className="empty">No data yet</p>
        )}
      </div>
    </div>
  )
}

export default App
