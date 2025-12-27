import { Link } from 'react-router-dom'

export function ExamplesPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-500 mb-8">
        <Link to="/docs" className="hover:text-white transition">Docs</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">Examples</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="gradient-text">Examples</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          Learn by example. See ReactScope in action with real-world use cases.
        </p>
      </div>

      {/* Example Cards */}
      <div className="grid gap-6">
        <Link to="/docs/examples/basic" className="gradient-border p-6 group hover:border-blue-500/30 transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">Basic Usage</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Get started with ReactScope in a simple React application. Learn the fundamentals of component profiling.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">useScope</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Provider</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Metrics</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link to="/docs/examples/custom-plugin" className="gradient-border p-6 group hover:border-purple-500/30 transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">Custom Plugin</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Create your own plugin to extend ReactScope's functionality. Learn the plugin architecture.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Plugin API</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Events</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Kernel</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link to="/docs/examples/production" className="gradient-border p-6 group hover:border-green-500/30 transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-green-400 transition">Production Setup</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Best practices for using ReactScope in production. Sampling, conditional loading, and performance.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Sampling</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Lazy Loading</span>
                <span className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400">Tree Shaking</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-green-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Try Playground */}
      <div className="mt-12 gradient-border p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Want to try it yourself?</h2>
        <p className="text-zinc-400 mb-6">
          Experiment with ReactScope in our interactive playground.
        </p>
        <Link
          to="/playground"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Open Playground
        </Link>
      </div>
    </div>
  )
}
