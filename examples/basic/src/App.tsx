import React from 'react'
import { useScope } from '@oxog/reactscope'

function App() {
  const scope = useScope('App')
  const [count, setCount] = React.useState(0)

  return (
    <div className="container">
      <h1>ReactScope Basic Example</h1>

      <div className="card">
        <Counter />
      </div>

      <div className="card">
        <h2>Parent Component Metrics</h2>
        <ul>
          <li>Render count: {scope.renderCount}</li>
          <li>Average render time: {scope.averageRenderTime.toFixed(2)}ms</li>
          <li>Last render time: {scope.lastRenderTime.toFixed(2)}ms</li>
          <li>Wasted renders: {scope.wastedRenders}</li>
        </ul>
        <button onClick={() => setCount(c => c + 1)}>
          Force re-render ({count})
        </button>
      </div>

      <div className="card">
        <ExpensiveComponent />
      </div>
    </div>
  )
}

function Counter() {
  const scope = useScope('Counter')
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <div className="metrics">
        <span>Renders: {scope.renderCount}</span>
        <span>Avg: {scope.averageRenderTime.toFixed(2)}ms</span>
      </div>
    </div>
  )
}

function ExpensiveComponent() {
  const scope = useScope('ExpensiveComponent')

  // Simulate expensive computation
  const result = React.useMemo(() => {
    let sum = 0
    for (let i = 0; i < 100000; i++) {
      sum += Math.sqrt(i)
    }
    return sum.toFixed(2)
  }, [])

  return (
    <div>
      <h2>Expensive Component</h2>
      <p>Computed value: {result}</p>
      <div className="metrics">
        <span>Renders: {scope.renderCount}</span>
        <span>Avg: {scope.averageRenderTime.toFixed(2)}ms</span>
      </div>
    </div>
  )
}

export default App
