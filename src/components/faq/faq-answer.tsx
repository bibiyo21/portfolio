import type { ReactNode } from 'react'
import type { Profile } from '../../lib/content-schemas'

/** Fills {email}, {phone}, {linkedin}, {github}, {whatsapp} tokens from the profile. Unknown tokens stay as text. */
export function renderAnswer(answer: string, profile: Profile): ReactNode[] {
  const link = (href: string, text: string, external = true) => (
    <a
      key={`${href}-${text}`}
      href={href}
      className="font-medium text-burgundy underline underline-offset-4"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {text}
    </a>
  )
  const tokens: Record<string, ReactNode> = {
    email: link(`mailto:${profile.email}`, profile.email, false),
    phone: profile.phoneDisplay,
    whatsapp: link(profile.links.whatsapp, 'WhatsApp'),
    linkedin: link(profile.links.linkedin, 'LinkedIn'),
    github: link(profile.links.github, 'GitHub'),
  }
  return answer.split(/(\{[a-z]+\})/g).map((part, i) => {
    const m = /^\{([a-z]+)\}$/.exec(part)
    const hit = m ? tokens[m[1]!] : undefined
    return hit !== undefined ? <span key={i}>{hit}</span> : <span key={i}>{part}</span>
  })
}
