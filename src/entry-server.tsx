import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Build-time prerender (scripts/prerender.ts): the page's content goes into the initial HTML for crawlers and
// link previews. The browser then renders the live app over it.
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
