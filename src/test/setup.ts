import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  if (typeof document !== 'undefined') cleanup()
})

// The API tests run in the node environment, where none of the DOM shims below apply.
if (typeof window !== 'undefined') {
  // jsdom lacks these browser APIs that the app relies on.
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', IO)
  vi.stubGlobal('ResizeObserver', IO)

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
  }
  Element.prototype.scrollIntoView = () => {}
}
