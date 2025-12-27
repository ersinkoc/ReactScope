import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xl relative z-10"
      >
        <div className="animate-float mb-8">
          <span className="text-[180px] sm:text-[220px] font-black leading-none gradient-text">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Looks like this component got unmounted. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition shadow-lg shadow-blue-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold border border-white/10 hover:border-white/30 transition text-zinc-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read Docs
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-zinc-500 text-sm mb-4">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/docs/getting-started" className="text-sm text-zinc-400 hover:text-blue-400 transition">
              Getting Started
            </Link>
            <span className="text-zinc-700">|</span>
            <Link to="/docs/api" className="text-sm text-zinc-400 hover:text-blue-400 transition">
              API Reference
            </Link>
            <span className="text-zinc-700">|</span>
            <Link to="/playground" className="text-sm text-zinc-400 hover:text-blue-400 transition">
              Playground
            </Link>
            <span className="text-zinc-700">|</span>
            <a
              href="https://github.com/ersinkoc/reactscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-blue-400 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
