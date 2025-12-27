import { motion } from 'framer-motion'

const steps = [
  {
    number: '1',
    title: 'Wrap Your App',
    description: 'Wrap your root component with ReactScopeProvider. Zero configuration needed.',
    code: `<ReactScopeProvider>
  <App />
</ReactScopeProvider>`,
    file: 'main.tsx',
    color: 'accent',
  },
  {
    number: '2',
    title: 'Add useScope Hook',
    description: 'Use the hook in any component you want to profile. Get instant metrics.',
    code: `function Dashboard() {
  const scope = useScope('Dashboard')
  // Your component logic
}`,
    file: 'Dashboard.tsx',
    color: 'purple-500',
  },
  {
    number: '3',
    title: 'Analyze Metrics',
    description: 'Access real-time metrics including render counts, timing, and wasted renders.',
    code: `scope.renderCount    // 42
scope.averageRenderTime // 1.23ms
scope.wastedRenders  // 5`,
    file: 'output',
    color: 'pink-500',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Three simple steps to start profiling your React application.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-${step.color}/20 flex items-center justify-center text-xl font-bold text-${step.color} border border-${step.color}/30`}>
                {step.number}
              </div>
              <div className="gradient-border p-6 pt-10 h-full">
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-zinc-400 mb-4">{step.description}</p>
                <div className="code-window text-sm">
                  <div className="code-window-header">
                    <span className="text-xs text-zinc-500">{step.file}</span>
                  </div>
                  <pre className="p-3 overflow-x-auto">
                    <code className="text-zinc-300 font-mono text-xs">{step.code}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
