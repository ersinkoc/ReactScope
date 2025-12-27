import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactScopeProvider } from '@oxog/reactscope'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactScopeProvider
      onReady={(kernel) => {
        console.log('ReactScope initialized!', kernel)
      }}
    >
      <App />
    </ReactScopeProvider>
  </React.StrictMode>
)
