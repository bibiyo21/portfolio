import { useEffect, type ReactNode } from 'react'
import { profile } from '../../lib/content-loader'
import { CASE_STUDIES_PATH } from '../../lib/routes'
import { Container } from '../layout/Container'
import { Logo } from '../ui/Logo'

// Read once when the module loads, like the home page footer.
const year = new Date().getFullYear()

/**
 * Frame for the standalone pages (case-studies index and case studies). The home page has its own scene
 * navigation; these pages are plain documents with a slim header and a footer that link back to it.
 */
export function PageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])

  const link = 'link-draw inline-flex min-h-11 items-center text-sm font-medium hover:text-burgundy'
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 text-charcoal backdrop-blur-[14px]">
        <Container className="flex h-[var(--nav-h)] items-center justify-between gap-4">
          <a href="/" className="inline-flex min-h-11 items-center" aria-label={`${profile.wordmark}, back to the portfolio`}>
            <Logo variant="light" height={44} alt="" />
          </a>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-4 sm:gap-6">
              <li>
                <a href="/#work" className={link}>
                  Work
                </a>
              </li>
              <li>
                <a href={CASE_STUDIES_PATH} className={link}>
                  Case studies
                </a>
              </li>
              <li>
                <a href="/#contact" className={link}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </Container>
      </header>
      <main id="main" className="bg-ivory text-charcoal">
        {children}
      </main>
      <footer className="on-dark border-t border-ivory/10 bg-burgundy-deep py-8 text-on-dark-mute">
        <Container className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <Logo variant="dark" height={48} />
            <p className="t-caption">
              © {year} {profile.name} · {profile.location}
            </p>
          </div>
          <a href="/" className="link-draw inline-flex min-h-11 items-center text-sm text-on-dark-soft hover:text-peach">
            Back to the portfolio
          </a>
        </Container>
      </footer>
    </>
  )
}
