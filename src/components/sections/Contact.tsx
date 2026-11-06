import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Button } from '../ui/Button'
import { MaskedLines } from '../ui/MaskedLines'
import { Reveal } from '../ui/Reveal'
import { useContactModal } from '../../hooks/useContactModal'
import { profile } from '../../lib/content-loader'
import { GithubIcon, LinkedinIcon } from '../../lib/icons'

const linkCls =
  'group flex min-h-14 items-center gap-4 rounded-2xl border border-ivory/15 px-5 py-3 transition-colors hover:border-peach hover:bg-ivory/[0.05]'

export function Contact() {
  const { openModal } = useContactModal()
  const { contact } = profile
  return (
    <Scene id="contact" tone="dark" center backdrop={<SceneBackdrop tone="dark" />}>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="t-eyebrow mb-6 text-peach">11 — {contact.eyebrow}</p>
          </Reveal>
          <MaskedLines as="h2" id="contact-title" lines={[contact.heading]} className="t-display-l" />
          <Reveal delay={0.1}>
            <p className="t-lede mt-6 max-w-xl text-on-dark-soft">{contact.text}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <Button variant="onDark" arrow onClick={openModal} aria-haspopup="dialog">
              Send an inquiry
            </Button>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-5" delay={0.1}>
          <ul className="space-y-3" aria-label="Contact details">
            <li>
              <a className={linkCls} href={`mailto:${profile.email}`}>
                <Mail className="size-5 shrink-0 text-peach" aria-hidden />
                <span>
                  <span className="t-caption block text-on-dark-mute">Email</span>
                  <span className="break-all">{profile.email}</span>
                </span>
              </a>
            </li>
            <li>
              <a className={linkCls} href={profile.links.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5 shrink-0 text-peach" aria-hidden />
                <span>
                  <span className="t-caption block text-on-dark-mute">WhatsApp</span>
                  {profile.phoneDisplay}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
            <li>
              <div className="flex min-h-14 items-center gap-4 rounded-2xl border border-ivory/15 px-5 py-3">
                <Phone className="size-5 shrink-0 text-peach" aria-hidden />
                <span>
                  <span className="t-caption block text-on-dark-mute">Viber</span>
                  {profile.viber ?? profile.phoneDisplay}
                </span>
              </div>
            </li>
            <li>
              <a className={linkCls} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedinIcon className="size-5 shrink-0 text-peach" aria-hidden />
                <span>
                  LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
            <li>
              <a className={linkCls} href={profile.links.github} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="size-5 shrink-0 text-peach" aria-hidden />
                <span>
                  GitHub
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
            <li className="flex items-center gap-3 px-5 pt-2 text-sm text-on-dark-mute">
              <MapPin className="size-4" aria-hidden />
              {profile.location}
            </li>
          </ul>
        </Reveal>
      </div>
    </Scene>
  )
}
