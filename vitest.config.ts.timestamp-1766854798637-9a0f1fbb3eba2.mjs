// vitest.config.ts
import { defineConfig } from "file:///D:/Codebox/__NPM__/ReactScope/node_modules/vitest/dist/config.js";
var vitest_config_default = defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/types.ts"
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    },
    setupFiles: ["./tests/setup.ts"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXENvZGVib3hcXFxcX19OUE1fX1xcXFxSZWFjdFNjb3BlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxDb2RlYm94XFxcXF9fTlBNX19cXFxcUmVhY3RTY29wZVxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Db2RlYm94L19fTlBNX18vUmVhY3RTY29wZS92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdoYXBweS1kb20nLFxuICAgIGluY2x1ZGU6IFsndGVzdHMvKiovKi50ZXN0Lnt0cyx0c3h9J10sXG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxuICAgICAgcmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnXSxcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3RzLHRzeH0nXSxcbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxuICAgICAgICAnc3JjLyoqL2luZGV4LnRzJyxcbiAgICAgICAgJ3NyYy90eXBlcy50cycsXG4gICAgICBdLFxuICAgICAgdGhyZXNob2xkczoge1xuICAgICAgICBzdGF0ZW1lbnRzOiAxMDAsXG4gICAgICAgIGJyYW5jaGVzOiAxMDAsXG4gICAgICAgIGZ1bmN0aW9uczogMTAwLFxuICAgICAgICBsaW5lczogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNldHVwRmlsZXM6IFsnLi90ZXN0cy9zZXR1cC50cyddLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUyxvQkFBb0I7QUFFbFQsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLDBCQUEwQjtBQUFBLElBQ3BDLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQ2pDLFNBQVMsQ0FBQyxtQkFBbUI7QUFBQSxNQUM3QixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLFFBQ1YsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFZLENBQUMsa0JBQWtCO0FBQUEsRUFDakM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
