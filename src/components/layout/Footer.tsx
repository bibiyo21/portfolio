import { ArrowUp } from 'lucide-react'
import { useScene } from '../../hooks/useScene'
import { profile } from '../../lib/content-loader'
import { Container } from './Container'

export function Footer() {
  const year = new Date().getFullYear()
  const { goTo } = useScene()
  return (
    <footer className="on-dark snap-end-footer border-t border-ivory/10 bg-burgundy-deep py-8 text-on-dark-mute">
      <Container className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="t-caption">
          © {year} {profile.name} · {profile.location}
        </p>
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            goTo('home')
          }}
          className="link-draw inline-flex min-h-11 items-center gap-2 text-sm text-on-dark-soft hover:text-peach"
        >
          Back to top <ArrowUp className="size-4" aria-hidden />
        </a>
      </Container>
    </footer>
  )
}
