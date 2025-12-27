import { useState } from 'react'
import { Link } from 'react-router-dom'

export function GettingStartedPage() {
  const [activeTab, setActiveTab] = useState<'npm' | 'yarn' | 'pnpm'>('npm')

  const installCommands = {
    npm: 'npm install @oxog/reactscope',
    yarn: 'yarn add @oxog/reactscope',
    pnpm: 'pnpm add @oxog/reactscope',
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-500 mb-8">
        <Link to="/docs" className="hover:text-white transition">Docs</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">Getting Started</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="gradient-text">Getting Started</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          Install ReactScope and set up your first profiling session in minutes.
        </p>
      </div>

      {/* Installation */}
      <section id="installation" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">1</span>
          <h2 className="text-2xl font-bold">Installation</h2>
        </div>

        <p className="text-zinc-400 mb-6">Install ReactScope using your preferred package manager:</p>

        <div className="gradient-border overflow-hidden">
          <div className="flex border-b border-white/5">
            {(['npm', 'yarn', 'pnpm'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm transition ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 bg-black/40 font-mono text-sm">
            <span className="text-zinc-500">$ </span>
            <span className="text-green-400">{installCommands[activeTab]}</span>
          </div>
        </div>
      </section>

      {/* Basic Setup */}
      <section id="setup" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">2</span>
          <h2 className="text-2xl font-bold">Basic Setup</h2>
        </div>

        <p className="text-zinc-400 mb-6">
          Wrap your application with <code className="bg-zinc-800/80 px-2 py-0.5 rounded text-blue-400 text-sm">ReactScopeProvider</code>:
        </p>

        <div className="gradient-border p-4 bg-black/40">
          <pre className="text-sm overflow-x-auto"><code className="language-tsx">{`import { ReactScopeProvider } from '@oxog/reactscope'

function App() {
  return (
    <ReactScopeProvider>
      <YourApp />
    </ReactScopeProvider>
  )
}`}</code></pre>
        </div>
      </section>

      {/* useScope Hook */}
      <section id="hook" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">3</span>
          <h2 className="text-2xl font-bold">Using the useScope Hook</h2>
        </div>

        <p className="text-zinc-400 mb-6">
          Track a component's performance with the <code className="bg-zinc-800/80 px-2 py-0.5 rounded text-blue-400 text-sm">useScope</code> hook:
        </p>

        <div className="gradient-border p-4 bg-black/40 mb-6">
          <pre className="text-sm overflow-x-auto"><code className="language-tsx">{`import { useScope } from '@oxog/reactscope'

function MyComponent({ data }) {
  const scope = useScope('MyComponent')

  // Access metrics
  console.log('Render count:', scope.renderCount)
  console.log('Average render time:', scope.averageRenderTime)
  console.log('Wasted renders:', scope.wastedRenders)

  return <div>{data}</div>
}`}</code></pre>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="gradient-border p-4">
            <div className="text-sm font-medium text-blue-400 mb-1">renderCount</div>
            <div className="text-zinc-400 text-xs">Total number of times the component has rendered</div>
          </div>
          <div className="gradient-border p-4">
            <div className="text-sm font-medium text-purple-400 mb-1">averageRenderTime</div>
            <div className="text-zinc-400 text-xs">Average render duration in milliseconds</div>
          </div>
          <div className="gradient-border p-4">
            <div className="text-sm font-medium text-amber-400 mb-1">wastedRenders</div>
            <div className="text-zinc-400 text-xs">Renders with no actual DOM changes</div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section id="dashboard" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">4</span>
          <h2 className="text-2xl font-bold">Using the Dashboard</h2>
        </div>

        <p className="text-zinc-400 mb-6">Enable the visual dashboard for real-time monitoring:</p>

        <div className="gradient-border p-4 bg-black/40 mb-6">
          <pre className="text-sm overflow-x-auto"><code className="language-tsx">{`import { ReactScopeProvider, createDashboardUIPlugin } from '@oxog/reactscope'

function App() {
  return (
    <ReactScopeProvider
      plugins={[createDashboardUIPlugin()]}
      onReady={(kernel) => {
        kernel.getPlugin('dashboard-ui')?.api.show()
      }}
    >
      <YourApp />
    </ReactScopeProvider>
  )
}`}</code></pre>
        </div>

        <div className="gradient-border p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          </div>
          <div>
            <div className="font-medium mb-1">Keyboard Shortcut</div>
            <p className="text-zinc-400 text-sm">
              Press <kbd className="bg-zinc-800 px-2 py-0.5 rounded text-xs border border-zinc-700">Ctrl</kbd> + <kbd className="bg-zinc-800 px-2 py-0.5 rounded text-xs border border-zinc-700">Shift</kbd> + <kbd className="bg-zinc-800 px-2 py-0.5 rounded text-xs border border-zinc-700">R</kbd> to toggle the dashboard
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="gradient-border p-8">
        <h2 className="text-xl font-bold mb-6">Next Steps</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/docs/api" className="group flex items-center gap-3 p-4 bg-black/20 rounded-xl hover:bg-black/40 transition">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm group-hover:text-blue-400 transition">Explore API</span>
          </Link>
          <Link to="/docs/examples" className="group flex items-center gap-3 p-4 bg-black/20 rounded-xl hover:bg-black/40 transition">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm group-hover:text-blue-400 transition">See Examples</span>
          </Link>
          <Link to="/docs/api/plugins" className="group flex items-center gap-3 p-4 bg-black/20 rounded-xl hover:bg-black/40 transition">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <span className="text-sm group-hover:text-blue-400 transition">Learn Plugins</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
