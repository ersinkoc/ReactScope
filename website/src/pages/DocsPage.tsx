import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const sidebar = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Installation', href: '/docs/getting-started' },
      { label: 'Basic Setup', href: '/docs/getting-started#setup' },
      { label: 'Dashboard', href: '/docs/getting-started#dashboard' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Provider', href: '/docs/api/provider' },
      { label: 'Hooks', href: '/docs/api/hooks' },
      { label: 'Components', href: '/docs/api/components' },
      { label: 'Plugins', href: '/docs/api/plugins' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { label: 'Basic Usage', href: '/docs/examples/basic' },
      { label: 'Custom Plugin', href: '/docs/examples/custom-plugin' },
      { label: 'Production', href: '/docs/examples/production' },
    ],
  },
]

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Learn how to install and set up ReactScope in your project.',
    href: '/docs/getting-started',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'API Reference',
    description: 'Explore the complete API including hooks, components, and plugins.',
    href: '/docs/api',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Examples',
    description: 'See ReactScope in action with practical examples.',
    href: '/docs/examples',
    icon: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Plugins',
    description: 'Discover built-in plugins and learn to create custom ones.',
    href: '/docs/api/plugins',
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
]

export function DocsPage() {
  const location = useLocation()

  return (
    <div className="pt-16">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-8">
              {sidebar.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3 pl-4">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={`text-sm transition hover:text-white hover:pl-2 block ${
                            location.pathname === item.href
                              ? 'text-accent-light'
                              : 'text-zinc-400'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="gradient-text">Documentation</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl">
                Learn how to profile and optimize your React applications with ReactScope's powerful tools and plugins.
              </p>
            </motion.div>

            {/* Quick Links Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-16">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="block gradient-border p-6 group hover:border-accent/30 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        {link.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-light transition">
                          {link.title}
                        </h3>
                        <p className="text-zinc-400 text-sm">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Core Concepts */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Core Concepts</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Micro-Kernel Architecture',
                    description: 'ReactScope uses a micro-kernel architecture where the core is minimal and all features are implemented as plugins.',
                  },
                  {
                    title: 'Zero Dependencies',
                    description: 'No external runtime dependencies. Everything is built from scratch for optimal performance.',
                  },
                  {
                    title: 'React 18+ Support',
                    description: 'Full support for React 18 features including Concurrent Mode and Suspense.',
                  },
                ].map((concept) => (
                  <div key={concept.title} className="gradient-border p-5">
                    <h3 className="font-semibold mb-2">{concept.title}</h3>
                    <p className="text-zinc-400 text-sm">{concept.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Explore More */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Explore More</h2>
              <Link
                to="/playground"
                className="flex items-center justify-between p-6 gradient-border group hover:border-green-500/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-green-400 transition">
                      Try the Playground
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Experiment with ReactScope in an interactive environment
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-green-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
