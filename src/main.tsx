import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

const app = (
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
)

// Production HTML is prerendered (scripts/prerender.ts), so React attaches to the existing markup instead of
// replacing it. The dev server serves an empty #root and renders from scratch.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
