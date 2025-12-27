import React from 'react'
import {
  useScope,
  useScopeSummary,
  useAllScopeMetrics,
  Scope,
  withScope
} from '@oxog/reactscope'

function App() {
  const [activeTab, setActiveTab] = React.useState<'demo' | 'monitor'>('demo')

  return (
    <div className="app">
      <header>
        <h1>ReactScope Advanced Example</h1>
        <p>Press Ctrl+Shift+R to toggle the dashboard</p>
        <nav>
          <button
            className={activeTab === 'demo' ? 'active' : ''}
            onClick={() => setActiveTab('demo')}
          >
            Demo Components
          </button>
          <button
            className={activeTab === 'monitor' ? 'active' : ''}
            onClick={() => setActiveTab('monitor')}
          >
            Performance Monitor
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'demo' ? <DemoSection /> : <MonitorSection />}
      </main>
    </div>
  )
}

function DemoSection() {
  return (
    <div className="demo-section">
      <div className="grid">
        <CounterCard />
        <TodoCard />
        <FetchCard />
      </div>
    </div>
  )
}

function CounterCard() {
  const scope = useScope('CounterCard')
  const [count, setCount] = React.useState(0)

  return (
    <div className="card">
      <h2>Counter</h2>
      <div className="counter-display">{count}</div>
      <div className="button-group">
        <button onClick={() => setCount(c => c - 1)}>-</button>
        <button onClick={() => setCount(c => c + 1)}>+</button>
      </div>
      <MetricsDisplay scope={scope} />
    </div>
  )
}

function TodoCard() {
  const scope = useScope('TodoCard')
  const [todos, setTodos] = React.useState<string[]>([])
  const [input, setInput] = React.useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos(t => [...t, input.trim()])
      setInput('')
    }
  }

  return (
    <div className="card">
      <h2>Todo List</h2>
      <div className="todo-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <Scope name="TodoList">
        <ul className="todo-list">
          {todos.map((todo, i) => (
            <TodoItem
              key={i}
              text={todo}
              onRemove={() => setTodos(t => t.filter((_, idx) => idx !== i))}
            />
          ))}
        </ul>
      </Scope>
      <MetricsDisplay scope={scope} />
    </div>
  )
}

// Using withScope HOC
const TodoItem = withScope(
  function TodoItemInner({ text, onRemove }: { text: string; onRemove: () => void }) {
    return (
      <li>
        <span>{text}</span>
        <button onClick={onRemove}>x</button>
      </li>
    )
  },
  { name: 'TodoItem', trackProps: true }
)

function FetchCard() {
  const scope = useScope('FetchCard')
  const [data, setData] = React.useState<{ title: string } | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setData({ title: `Post ${Math.floor(Math.random() * 100)}` })
    setLoading(false)
  }

  return (
    <div className="card">
      <h2>Async Data</h2>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && (
        <div className="data-display">
          <strong>{data.title}</strong>
        </div>
      )}
      <MetricsDisplay scope={scope} />
    </div>
  )
}

function MetricsDisplay({ scope }: { scope: { renderCount: number; averageRenderTime: number; wastedRenders: number } }) {
  return (
    <div className="metrics">
      <span>Renders: {scope.renderCount}</span>
      <span>Avg: {scope.averageRenderTime.toFixed(2)}ms</span>
      <span className={scope.wastedRenders > 0 ? 'warning' : ''}>
        Wasted: {scope.wastedRenders}
      </span>
    </div>
  )
}

function MonitorSection() {
  const summary = useScopeSummary()
  const allMetrics = useAllScopeMetrics()

  const sortedComponents = React.useMemo(() => {
    return Array.from(allMetrics.values())
      .sort((a, b) => b.renderCount - a.renderCount)
  }, [allMetrics])

  const wastedPercentage = summary.totalRenders > 0
    ? ((summary.totalWastedRenders / summary.totalRenders) * 100).toFixed(1)
    : '0'

  return (
    <div className="monitor-section">
      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-value">{summary.totalComponents}</div>
          <div className="stat-label">Components</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.totalRenders}</div>
          <div className="stat-label">Total Renders</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{summary.totalWastedRenders}</div>
          <div className="stat-label">Wasted ({wastedPercentage}%)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.averageRenderTime.toFixed(2)}ms</div>
          <div className="stat-label">Avg Render Time</div>
        </div>
      </div>

      <div className="component-list">
        <h3>Component Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Renders</th>
              <th>Avg Time</th>
              <th>Wasted</th>
            </tr>
          </thead>
          <tbody>
            {sortedComponents.map(m => (
              <tr key={m.componentId}>
                <td>{m.componentName}</td>
                <td>{m.renderCount}</td>
                <td>{m.averageRenderTime.toFixed(2)}ms</td>
                <td className={m.wastedRenderCount > 0 ? 'warning' : ''}>
                  {m.wastedRenderCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
