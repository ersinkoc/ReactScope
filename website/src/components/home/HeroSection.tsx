import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const codeExample = `import { ReactScopeProvider, useScope } from '@oxog/reactscope'

function App() {
  return (
    <ReactScopeProvider>
      <Dashboard />
    </ReactScopeProvider>
  )
}

function Dashboard() {
  const scope = useScope('Dashboard')

  return (
    <div>
      <p>Renders: {scope.renderCount}</p>
      <p>Avg: {scope.averageRenderTime.toFixed(2)}ms</p>
      <p>Wasted: {scope.wastedRenders}</p>
    </div>
  )
}`

export function HeroSection() {
  const [installTab, setInstallTab] = useState<'npm' | 'yarn' | 'pnpm'>('npm')
  const [copied, setCopied] = useState(false)

  const installCommands = {
    npm: 'npm install @oxog/reactscope',
    yarn: 'yarn add @oxog/reactscope',
    pnpm: 'pnpm add @oxog/reactscope',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommands[installTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              v1.0.0 — Production Ready
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              React Performance
              <br />
              <span className="gradient-text">Profiler That Scales</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Zero-dependency profiler with micro-kernel architecture. Track renders, detect wasted updates, and ship faster React apps.
            </p>

            {/* Install Command */}
            <div className="max-w-md mx-auto lg:mx-0 mb-8">
              <div className="code-window glow-sm">
                <div className="code-window-header justify-between">
                  <div className="flex gap-2">
                    {(['npm', 'yarn', 'pnpm'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setInstallTab(tab)}
                        className={`text-sm font-medium transition ${
                          installTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleCopy} className="text-zinc-500 hover:text-white transition">
                    {copied ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="p-4 font-mono text-sm">
                  <span className="text-zinc-500">$</span>
                  <span className="text-zinc-100"> {installCommands[installTab]}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/docs/getting-started"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/playground"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 font-semibold rounded-xl border border-green-500/30 transition hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Try Playground
              </Link>
            </div>
          </motion.div>

          {/* Right: Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="code-window glow animate-float">
              <div className="code-window-header">
                <div className="flex gap-2">
                  <div className="code-window-dot bg-red-500" />
                  <div className="code-window-dot bg-yellow-500" />
                  <div className="code-window-dot bg-green-500" />
                </div>
                <span className="text-xs text-zinc-500">App.tsx</span>
              </div>
              <pre className="p-5 overflow-x-auto text-sm">
                <code className="text-zinc-300 font-mono">{codeExample}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
