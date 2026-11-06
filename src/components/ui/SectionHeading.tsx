import { Reveal } from './Reveal'

export function SectionHeading({
  index,
  eyebrow,
  title,
  id,
  tone = 'light',
  intro,
  layout = 'stack',
}: {
  index: string
  eyebrow: string
  title: string
  id: string
  tone?: 'light' | 'dark'
  intro?: string
  /** `split` puts the intro beside the title on large screens: a shorter header and a different rhythm. */
  layout?: 'stack' | 'split'
}) {
  const dark = tone === 'dark'
  const split = layout === 'split' && Boolean(intro)
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
      <div className={split ? 'lg:grid lg:grid-cols-12 lg:items-end lg:gap-12' : undefined}>
        <Reveal delay={0.05} className={split ? 'lg:col-span-7' : undefined}>
          <h2 id={id} className="t-display-l max-w-4xl">
            {title}
          </h2>
        </Reveal>
        {intro ? (
          <Reveal delay={0.1} className={split ? 'lg:col-span-5' : undefined}>
            <p className={`t-body-l mt-6 max-w-2xl ${split ? 'lg:mt-0' : ''} ${dark ? 'text-on-dark-soft' : 'text-ink-soft'}`}>{intro}</p>
          </Reveal>
        ) : null}
      </div>
    </header>
  )
}
