import { useState } from 'react'
import { motion } from 'framer-motion'

export function DemoSection() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    avgRenderTime: 0,
    wastedRenders: 0,
    propsChanges: 0,
    totalRenderTime: 0,
  })
  const [events, setEvents] = useState<Array<{ type: string; message: string; time: string }>>([])
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    posts: 42,
    followers: 1337,
    likes: 2048,
  })

  const getTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour12: false })
  }

  const addEvent = (type: string, message: string) => {
    setEvents((prev) => [{ type, message, time: getTime() }, ...prev.slice(0, 19)])
  }

  const updateProps = () => {
    const renderTime = Math.random() * 3 + 0.5
    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      propsChanges: prev.propsChanges + 1,
      totalRenderTime: prev.totalRenderTime + renderTime,
      avgRenderTime: (prev.totalRenderTime + renderTime) / (prev.renderCount + 1),
    }))
    setUser((prev) => ({
      ...prev,
      posts: prev.posts + Math.floor(Math.random() * 5),
      followers: prev.followers + Math.floor(Math.random() * 100),
      likes: prev.likes + Math.floor(Math.random() * 50),
    }))
    addEvent('props', `Props changed: posts=${user.posts + 1}`)
    addEvent('render', `Render completed in ${renderTime.toFixed(2)}ms`)
  }

  const triggerRender = () => {
    const renderTime = Math.random() * 2 + 0.3
    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      totalRenderTime: prev.totalRenderTime + renderTime,
      avgRenderTime: (prev.totalRenderTime + renderTime) / (prev.renderCount + 1),
    }))
    addEvent('render', `Render completed in ${renderTime.toFixed(2)}ms`)
  }

  const wastedRender = () => {
    const renderTime = Math.random() * 1.5 + 0.2
    setMetrics((prev) => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      wastedRenders: prev.wastedRenders + 1,
      totalRenderTime: prev.totalRenderTime + renderTime,
      avgRenderTime: (prev.totalRenderTime + renderTime) / (prev.renderCount + 1),
    }))
    addEvent('wasted', `Wasted render detected! (${renderTime.toFixed(2)}ms)`)
  }

  const resetDemo = () => {
    setMetrics({ renderCount: 0, avgRenderTime: 0, wastedRenders: 0, propsChanges: 0, totalRenderTime: 0 })
    setEvents([])
    setUser({ name: 'Alex Johnson', email: 'alex@example.com', posts: 42, followers: 1337, likes: 2048 })
  }

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Click the buttons below to simulate component renders and watch ReactScope track the metrics in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Simulated Component */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="gradient-border p-6 glow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                UserProfile Component
              </h3>
              <span className="text-xs text-zinc-500 font-mono">id: comp_01</span>
            </div>

            <div className="bg-dark-900/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{user.name}</h4>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-accent">{user.posts}</div>
                  <div className="text-xs text-zinc-500">Posts</div>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-purple-400">{user.followers}</div>
                  <div className="text-xs text-zinc-500">Followers</div>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-pink-400">{user.likes}</div>
                  <div className="text-xs text-zinc-500">Likes</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={updateProps}
                className="px-4 py-3 bg-accent/20 hover:bg-accent/30 text-accent-light rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                Update Props
              </button>
              <button
                onClick={triggerRender}
                className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                Trigger Render
              </button>
              <button
                onClick={wastedRender}
                className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                Wasted Render
              </button>
              <button
                onClick={resetDemo}
                className="px-4 py-3 bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Metrics Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="gradient-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Real-time Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{metrics.renderCount}</div>
                  <div className="text-sm text-zinc-500">Total Renders</div>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {metrics.avgRenderTime.toFixed(2)}
                    <span className="text-lg">ms</span>
                  </div>
                  <div className="text-sm text-zinc-500">Avg Render Time</div>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{metrics.wastedRenders}</div>
                  <div className="text-sm text-zinc-500">Wasted Renders</div>
                </div>
                <div className="bg-dark-900/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{metrics.propsChanges}</div>
                  <div className="text-sm text-zinc-500">Props Changes</div>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Event Log
              </h3>
              <div className="bg-dark-900/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm space-y-2">
                {events.length === 0 ? (
                  <div className="text-zinc-600 text-center py-8">Click buttons to see events...</div>
                ) : (
                  events.map((event, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-zinc-600">{event.time}</span>
                      <span
                        className={
                          event.type === 'render'
                            ? 'text-blue-400'
                            : event.type === 'wasted'
                            ? 'text-amber-400'
                            : event.type === 'props'
                            ? 'text-green-400'
                            : 'text-purple-400'
                        }
                      >
                        [{event.type.toUpperCase()}]
                      </span>
                      <span className="text-zinc-300">{event.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
