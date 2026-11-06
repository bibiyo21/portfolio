import { Reveal } from './Reveal'

export function SectionHeading({
  index,
  eyebrow,
  title,
  id,
  tone = 'light',
  intro,
}: {
  index: string
  eyebrow: string
  title: string
  id: string
  tone?: 'light' | 'dark'
  intro?: string
}) {
  const dark = tone === 'dark'
  return (
    <header className="mb-10 md:mb-14">
      <Reveal>
        <div className="mb-6 flex items-center gap-4">
          <span className={`t-eyebrow ${dark ? 'text-peach' : 'text-burgundy'}`}>
            {index} — {eyebrow}
          </span>
          <span aria-hidden className={`h-px flex-1 ${dark ? 'bg-ivory/15' : 'bg-line-strong'}`} />
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 id={id} className="t-display-l max-w-4xl">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.1}>
          <p className={`t-body-l mt-6 max-w-2xl ${dark ? 'text-on-dark-soft' : 'text-ink-soft'}`}>{intro}</p>
        </Reveal>
      ) : null}
    </header>
  )
}
