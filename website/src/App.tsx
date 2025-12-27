import { Routes, Route } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { HomePage } from './pages/HomePage'
import { DocsPage } from './pages/DocsPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/*" element={<DocsPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
