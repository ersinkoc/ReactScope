import { Link } from 'react-router-dom'

export function ApiPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-500 mb-8">
        <Link to="/docs" className="hover:text-white transition">Docs</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">API Reference</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="gradient-text">API Reference</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          Complete reference for all ReactScope exports - hooks, components, plugins, and utilities.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        <Link to="/docs/api/hooks" className="gradient-border p-5 group hover:border-blue-500/30 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="font-semibold group-hover:text-blue-400 transition">Hooks</span>
          </div>
          <p className="text-sm text-zinc-400">useScope, useScopeMetrics, useScopeContext, and more</p>
        </Link>

        <Link to="/docs/api/components" className="gradient-border p-5 group hover:border-purple-500/30 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="font-semibold group-hover:text-purple-400 transition">Components</span>
          </div>
          <p className="text-sm text-zinc-400">Scope, withScope HOC, and declarative tracking</p>
        </Link>

        <Link to="/docs/api/plugins" className="gradient-border p-5 group hover:border-green-500/30 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <span className="font-semibold group-hover:text-green-400 transition">Plugins</span>
          </div>
          <p className="text-sm text-zinc-400">10 built-in plugins and custom plugin API</p>
        </Link>

        <Link to="/docs/api/provider" className="gradient-border p-5 group hover:border-amber-500/30 transition">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-semibold group-hover:text-amber-400 transition">Provider</span>
          </div>
          <p className="text-sm text-zinc-400">ReactScopeProvider configuration and options</p>
        </Link>
      </div>

      {/* Provider Section */}
      <section id="provider" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">ReactScopeProvider</h2>
        </div>
        <p className="text-zinc-400 mb-6">The root provider component that initializes the kernel and provides context to the component tree.</p>
        <div className="gradient-border p-4 bg-black/40">
          <pre className="text-sm overflow-x-auto"><code>{`interface ReactScopeProviderProps {
  children: React.ReactNode
  enabled?: boolean              // Default: true
  plugins?: Plugin[]             // Additional plugins
  onReady?: (kernel: Kernel) => void
  options?: {
    trackAllComponents?: boolean // Default: false
    sampleRate?: number          // Default: 1 (0-1)
    maxHistorySize?: number      // Default: 1000
  }
}`}</code></pre>
        </div>
      </section>

      {/* Hooks Section */}
      <section id="hooks" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Hooks</h2>
        </div>

        <div className="space-y-4">
          <div className="gradient-border p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-400">useScope</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">Primary</span>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Main profiling hook for tracking component renders.</p>
            <code className="text-sm text-green-400">function useScope(name: string, options?: UseScopeOptions): ScopeHandle</code>
          </div>

          <div className="gradient-border p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">useScopeMetrics</h3>
            <p className="text-zinc-400 text-sm mb-4">Read-only hook for accessing component metrics.</p>
            <code className="text-sm text-green-400">function useScopeMetrics(componentId: string): ComponentMetrics | undefined</code>
          </div>

          <div className="gradient-border p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">useScopeContext</h3>
            <p className="text-zinc-400 text-sm mb-4">Access the kernel instance directly.</p>
            <code className="text-sm text-green-400">function useScopeContext(): Kernel</code>
          </div>
        </div>
      </section>

      {/* Kernel Section */}
      <section id="kernel" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Kernel</h2>
        </div>
        <p className="text-zinc-400 mb-6">The central micro-kernel that manages plugins, events, and metrics.</p>
        <div className="gradient-border p-4 bg-black/40">
          <pre className="text-sm overflow-x-auto"><code>{`interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined

  // Event system
  emit(event: KernelEvent): void
  on<T extends KernelEvent['type']>(
    eventType: T,
    handler: (event: Extract<KernelEvent, { type: T }>) => void
  ): () => void

  // Metrics
  getMetrics(): MetricsStore
  getComponentMetrics(componentId: string): ComponentMetrics | undefined
  clearMetrics(): void

  // Lifecycle
  destroy(): void
}`}</code></pre>
        </div>
      </section>
    </div>
  )
}
