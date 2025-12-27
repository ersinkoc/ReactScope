import { motion } from 'framer-motion'

const stats = [
  { value: '0', label: 'Dependencies' },
  { value: '10', label: 'Built-in Plugins' },
  { value: '100%', label: 'TypeScript' },
  { value: '<5kb', label: 'Core Size (gzip)' },
]

export function StatsSection() {
  return (
    <section className="relative py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
