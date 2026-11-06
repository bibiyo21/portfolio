import { ArrowUp } from 'lucide-react'
import { profile, socialLinks } from '../../lib/content-loader'
import { getIcon } from '../../lib/icons'
import { Container } from './Container'

export function Footer() {
  const year = new Date().getFullYear()
  return (
      <footer className="on-dark border-t border-ivory/10 bg-burgundy-deep py-8 text-on-dark-mute">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="t-caption">
            © {year} {profile.name}. Built with React, Vite and Tailwind.
          </p>
          <ul className="flex flex-wrap items-center gap-6">
            {socialLinks.links.map((l) => {
              const Icon = getIcon(l.icon)
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw inline-flex min-h-11 items-center gap-2 text-sm text-on-dark-soft hover:text-peach"
                  >
                    <Icon className="size-4" aria-hidden />
                    {l.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )
            })}
            <li>
              <a
                href="#home"
                className="link-draw inline-flex min-h-11 items-center gap-2 text-sm text-on-dark-soft hover:text-peach"
              >
                Back to top <ArrowUp className="size-4" aria-hidden />
              </a>
            </li>
          </ul>
        </Container>
      </footer>
  )
}
