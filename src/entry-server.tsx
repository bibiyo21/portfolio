import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import Root from './Root'

// Build-time prerender (scripts/prerender.ts): the page's content goes into the initial HTML for crawlers and
// link previews. The browser then renders the live app over it.
export function render(path = '/'): string {
  return renderToString(
    <StrictMode>
      <Root path={path} />
    </StrictMode>,
  )
}
