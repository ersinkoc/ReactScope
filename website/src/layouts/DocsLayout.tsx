import { Link, Outlet, useLocation } from 'react-router-dom'

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
      { label: 'Overview', href: '/docs/api' },
      { label: 'Provider', href: '/docs/api/provider' },
      { label: 'Hooks', href: '/docs/api/hooks' },
      { label: 'Components', href: '/docs/api/components' },
      { label: 'Plugins', href: '/docs/api/plugins' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { label: 'Overview', href: '/docs/examples' },
      { label: 'Basic Usage', href: '/docs/examples/basic' },
      { label: 'Custom Plugin', href: '/docs/examples/custom-plugin' },
      { label: 'Production', href: '/docs/examples/production' },
    ],
  },
]

export function DocsLayout() {
  const location = useLocation()
  const currentPath = location.pathname

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
                    {section.items.map((item) => {
                      const isActive = currentPath === item.href ||
                        (item.href !== '/docs/getting-started' && currentPath.startsWith(item.href))
                      return (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={`text-sm transition hover:text-white hover:pl-2 block ${
                              isActive ? 'text-blue-400' : 'text-zinc-400'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
