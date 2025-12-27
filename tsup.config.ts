import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugins/render-tracker/index': 'src/plugins/render-tracker/index.ts',
    'plugins/props-differ/index': 'src/plugins/props-differ/index.ts',
    'plugins/wasted-render-detector/index': 'src/plugins/wasted-render-detector/index.ts',
    'plugins/lifecycle-tracker/index': 'src/plugins/lifecycle-tracker/index.ts',
    'plugins/dashboard-ui/index': 'src/plugins/dashboard-ui/index.ts',
    'plugins/console-reporter/index': 'src/plugins/console-reporter/index.ts',
    'plugins/json-exporter/index': 'src/plugins/json-exporter/index.ts',
    'plugins/timeline-recorder/index': 'src/plugins/timeline-recorder/index.ts',
    'plugins/memory-tracker/index': 'src/plugins/memory-tracker/index.ts',
    'plugins/network-correlator/index': 'src/plugins/network-correlator/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
