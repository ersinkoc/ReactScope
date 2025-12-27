# ReactScope Examples

This directory contains example projects demonstrating how to use ReactScope.

## Examples

### Basic Example

A simple example showing basic ReactScope usage with the `useScope` hook.

```bash
cd basic
npm install
npm run dev
```

**Features demonstrated:**
- ReactScopeProvider setup
- useScope hook for tracking renders
- Basic metrics display

### Advanced Example

A more comprehensive example with the dashboard and multiple plugins.

```bash
cd advanced
npm install
npm run dev
```

**Features demonstrated:**
- Dashboard UI plugin
- Console reporter plugin
- JSON exporter plugin
- Scope component wrapper
- withScope HOC
- useScopeSummary and useAllScopeMetrics hooks
- Custom performance monitoring UI

### Custom Plugin Example

Demonstrates how to create and use custom plugins.

```bash
cd with-custom-plugin
npm install
npm run dev
```

**Features demonstrated:**
- Creating custom plugins with createPlugin
- Plugin API exposure
- Event hooks (onRender, onMount, onUnmount)
- Plugin lifecycle (onInit, onDestroy)
- Accessing plugins from components

## Running Examples

Each example is a standalone Vite + React + TypeScript project. To run any example:

1. Navigate to the example directory
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open http://localhost:5173 in your browser

## Notes

- These examples use `@oxog/reactscope` as a dependency. In a real project, you would install it from npm.
- For local development with the main ReactScope package, you can use npm link or update the package.json to point to the local package.
