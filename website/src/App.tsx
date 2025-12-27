import { Routes, Route } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { DocsLayout } from './layouts/DocsLayout'
import { HomePage } from './pages/HomePage'
import { DocsIndexPage } from './pages/docs/DocsIndexPage'
import { GettingStartedPage } from './pages/docs/GettingStartedPage'
import { ApiPage } from './pages/docs/ApiPage'
import { ExamplesPage } from './pages/docs/ExamplesPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<DocsIndexPage />} />
          <Route path="getting-started" element={<GettingStartedPage />} />
          <Route path="api" element={<ApiPage />} />
          <Route path="api/:section" element={<ApiPage />} />
          <Route path="examples" element={<ExamplesPage />} />
          <Route path="examples/:section" element={<ExamplesPage />} />
        </Route>
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
