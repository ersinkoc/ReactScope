import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <span className="font-bold">ReactScope</span>
            </div>
            <p className="text-sm text-zinc-500">
              Zero-dependency React performance profiler with micro-kernel plugin architecture.
            </p>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/docs/getting-started" className="hover:text-white transition">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/docs/api" className="hover:text-white transition">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/docs/examples" className="hover:text-white transition">
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          {/* API */}
          <div>
            <h4 className="font-semibold mb-4">API</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/docs/api/provider" className="hover:text-white transition">
                  Provider
                </Link>
              </li>
              <li>
                <Link to="/docs/api/hooks" className="hover:text-white transition">
                  Hooks
                </Link>
              </li>
              <li>
                <Link to="/docs/api/plugins" className="hover:text-white transition">
                  Plugins
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a
                  href="https://github.com/ersinkoc/reactscope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ersinkoc/reactscope/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/@oxog/reactscope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  npm
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">© 2025 ReactScope. MIT License.</p>
          <p className="text-sm text-zinc-500">
            Made with ❤️ by{' '}
            <a
              href="https://github.com/ersinkoc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition"
            >
              ersinkoc
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
