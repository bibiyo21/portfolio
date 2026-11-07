import { ArrowUp } from 'lucide-react'
import { useScene } from '../../hooks/useScene'
import { profile } from '../../lib/content-loader'
import { Logo } from '../ui/Logo'
import { Container } from './Container'

// Read once when the module loads: the year does not need to change while the page is open.
const year = new Date().getFullYear()

export function Footer() {
  const { goTo } = useScene()
  return (
    <footer className="on-dark snap-end-footer border-t border-ivory/10 bg-burgundy-deep py-8 text-on-dark-mute">
      <Container className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-3">
          <Logo variant="dark" height={48} />
          <p className="t-caption">
            © {year} {profile.name} · {profile.location}
          </p>
        </div>
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
