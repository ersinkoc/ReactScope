import { motion } from 'framer-motion'

const features = [
  { name: 'Zero Dependencies', reactscope: true, devtools: null, wdyr: false },
  { name: 'Programmatic API', reactscope: true, devtools: false, wdyr: 'partial' },
  { name: 'Plugin Architecture', reactscope: true, devtools: false, wdyr: false },
  { name: 'Memory Tracking', reactscope: true, devtools: 'partial', wdyr: false },
  { name: 'Network Correlation', reactscope: true, devtools: false, wdyr: false },
  { name: 'JSON Export', reactscope: true, devtools: 'partial', wdyr: false },
  { name: 'Production Safe', reactscope: true, devtools: false, wdyr: 'partial' },
  { name: 'Full TypeScript', reactscope: true, devtools: true, wdyr: true },
]

const StatusIcon = ({ status }: { status: boolean | string | null }) => {
  if (status === true) {
    return <span className="text-green-400 text-xl">✓</span>
  }
  if (status === false) {
    return <span className="text-red-400 text-xl">✕</span>
  }
  if (status === 'partial') {
    return <span className="text-zinc-500">~</span>
  }
  return <span className="text-zinc-600">-</span>
}

export function ComparisonSection() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-transparent via-dark-800/50 to-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why ReactScope?</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            See how ReactScope compares to other profiling solutions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="gradient-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-zinc-400 font-medium">Feature</th>
                  <th className="p-4 text-center">
                    <span className="gradient-text font-bold">ReactScope</span>
                  </th>
                  <th className="p-4 text-center text-zinc-400">React DevTools</th>
                  <th className="p-4 text-center text-zinc-400">why-did-you-render</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {features.map((feature) => (
                  <tr key={feature.name} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-zinc-300">{feature.name}</td>
                    <td className="p-4 text-center">
                      <StatusIcon status={feature.reactscope} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusIcon status={feature.devtools} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusIcon status={feature.wdyr} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="text-center text-zinc-500 text-sm mt-4">
          <span className="text-green-400">✓</span> Supported &nbsp;&nbsp;
          <span className="text-zinc-500">~</span> Partial &nbsp;&nbsp;
          <span className="text-red-400">✕</span> Not Supported
        </p>
      </div>
    </section>
  )
}
