import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

const examples = [
  {
    id: 'counter',
    name: 'Counter',
    description: 'Simple counter with state',
    icon: '🔢',
    code: `import React, { useState } from 'react'
import { useScope } from '@oxog/reactscope'

function Counter() {
  const scope = useScope('Counter')
  const [count, setCount] = useState(0)

  return (
    <div className="p-6 bg-zinc-800 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">
        Count: {count}
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => setCount(c => c - 1)}
          className="px-4 py-2 bg-red-500 rounded-lg"
        >
          -
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          +
        </button>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Renders: {scope.renderCount}
      </p>
    </div>
  )
}

export default Counter`,
  },
  {
    id: 'todo',
    name: 'Todo List',
    description: 'List with add/remove',
    icon: '✅',
    code: `import React, { useState } from 'react'
import { useScope } from '@oxog/reactscope'

function TodoList() {
  const scope = useScope('TodoList')
  const [todos, setTodos] = useState(['Learn React', 'Try ReactScope'])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input])
      setInput('')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg"
        />
        <button onClick={addTodo} className="px-4 py-2 bg-blue-500 rounded-lg">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map((todo, i) => (
          <li key={i} className="flex justify-between p-3 bg-zinc-800 rounded-lg">
            <span>{todo}</span>
            <button onClick={() => setTodos(todos.filter((_, j) => j !== i))} className="text-red-400">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-zinc-400">Renders: {scope.renderCount}</p>
    </div>
  )
}

export default TodoList`,
  },
]

export function PlaygroundPage() {
  const [currentExample, setCurrentExample] = useState(examples[0])
  const [code, setCode] = useState(examples[0].code)
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    avgRenderTime: 0,
    wastedRenders: 0,
    propsChanges: 0,
  })
  const [events, setEvents] = useState<Array<{ type: string; component: string; message: string; time: string }>>([])
  const [activePanel, setActivePanel] = useState<'preview' | 'metrics' | 'timeline'>('preview')

  const loadExample = (example: typeof examples[0]) => {
    setCurrentExample(example)
    setCode(example.code)
  }

  const runCode = useCallback(() => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      simulateMount()
    }, 500)
  }, [])

  const simulateMount = () => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setEvents((prev) => [
      { type: 'mount', component: 'App', message: 'Component mounted', time },
      ...prev,
    ])
    setMetrics((prev) => ({ ...prev, renderCount: prev.renderCount + 1 }))
  }

  const simulateRender = () => {
    const duration = Math.random() * 5 + 1
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      avgRenderTime: (prev.avgRenderTime * (prev.renderCount) + duration) / (prev.renderCount + 1),
    }))
    setEvents((prev) => [
      { type: 'render', component: currentExample.name, message: `Rendered in ${duration.toFixed(2)}ms`, time },
      ...prev,
    ])
  }

  const simulateWastedRender = () => {
    const duration = Math.random() * 2 + 0.5
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setMetrics((prev) => ({
      ...prev,
      wastedRenders: prev.wastedRenders + 1,
    }))
    setEvents((prev) => [
      { type: 'wasted', component: currentExample.name, message: `Wasted render (${duration.toFixed(2)}ms)`, time },
      ...prev,
    ])
  }

  const clearEvents = () => {
    setEvents([])
    setMetrics({ renderCount: 0, avgRenderTime: 0, wastedRenders: 0, propsChanges: 0 })
  }

  return (
    <div className="pt-16 min-h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-400">Playground</span>

              {/* Example Selector */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition text-sm">
                  <span>{currentExample.icon}</span>
                  <span>{currentExample.name}</span>
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => loadExample(example)}
                      className={`w-full px-4 py-2 text-left hover:bg-white/5 transition flex items-center gap-3 ${
                        currentExample.id === example.id ? 'text-blue-400' : 'text-zinc-300'
                      }`}
                    >
                      <span className="text-lg">{example.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-zinc-500">{example.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition shadow-lg shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </button>
              <button
                onClick={clearEvents}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition text-sm text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-zinc-900/50">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/10 border border-blue-500/30 text-white">
              App.tsx
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Panel Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-zinc-900/50">
            {(['preview', 'metrics', 'timeline'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border border-transparent ${
                  activePanel === panel
                    ? 'bg-blue-500/10 border-blue-500/30 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {panel.charAt(0).toUpperCase() + panel.slice(1)}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-4">
            {activePanel === 'preview' && (
              <div className="space-y-4">
                <div className="bg-zinc-900/50 rounded-lg p-6 border border-white/5 min-h-[200px]">
                  {isRunning ? (
                    <div className="flex items-center justify-center py-12 text-zinc-500">
                      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Component Mounted
                      </div>
                      <p className="text-zinc-400 text-sm">Your React component is running with ReactScope profiling enabled.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={simulateRender}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition text-sm font-medium"
                  >
                    Trigger Render
                  </button>
                  <button
                    onClick={simulateWastedRender}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition text-sm font-medium"
                  >
                    Wasted Render
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'metrics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                    <div className="text-3xl font-bold text-blue-400">{metrics.renderCount}</div>
                    <div className="text-sm text-zinc-500">Renders</div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                    <div className="text-3xl font-bold text-purple-400">{metrics.avgRenderTime.toFixed(2)}ms</div>
                    <div className="text-sm text-zinc-500">Avg Time</div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                    <div className="text-3xl font-bold text-amber-400">{metrics.wastedRenders}</div>
                    <div className="text-sm text-zinc-500">Wasted</div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                    <div className="text-3xl font-bold text-green-400">{metrics.propsChanges}</div>
                    <div className="text-sm text-zinc-500">Props Changes</div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                  <h3 className="text-sm font-medium mb-4">Event Log</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {events.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-sm">No events yet</div>
                    ) : (
                      events.slice(0, 20).map((event, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/2 text-sm">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              event.type === 'render'
                                ? 'bg-blue-500/20 text-blue-400'
                                : event.type === 'mount'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {event.type}
                          </span>
                          <span className="text-zinc-400">{event.component}</span>
                          <span className="text-zinc-500 text-xs ml-auto">{event.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'timeline' && (
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                <h3 className="text-sm font-medium mb-4">Render Timeline</h3>
                <div className="text-center py-12 text-zinc-500 text-sm">
                  Trigger renders to see the timeline
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
