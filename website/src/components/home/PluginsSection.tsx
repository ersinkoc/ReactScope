import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const plugins = [
  { emoji: '📊', name: 'Render Tracker' },
  { emoji: '🔍', name: 'Props Differ' },
  { emoji: '⚠️', name: 'Wasted Detector' },
  { emoji: '🔄', name: 'Lifecycle Tracker' },
  { emoji: '💾', name: 'Memory Tracker' },
  { emoji: '🌐', name: 'Network Correlator' },
  { emoji: '⏱️', name: 'Timeline Recorder' },
  { emoji: '📝', name: 'Console Reporter' },
  { emoji: '📤', name: 'JSON Exporter' },
  { emoji: '🎨', name: 'Dashboard UI' },
]

export function PluginsSection() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">10 Built-in Plugins</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Ready-to-use plugins for common profiling needs. Mix and match as needed.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plugins.map((plugin, index) => (
            <motion.div
              key={plugin.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="plugin-card rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{plugin.emoji}</div>
              <div className="font-medium text-sm">{plugin.name}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/docs/api/plugins"
            className="inline-flex items-center gap-2 text-accent-light hover:text-white transition"
          >
            View all plugins
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
