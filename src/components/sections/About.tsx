import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { ParallaxLayer } from '../scenes/ParallaxLayer'
import { Img } from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Tag } from '../ui/Tag'
import { profile } from '../../lib/content-loader'

// Photos are the owner's originals, served as uploaded. Only CSS frames them: object-fit and object-position.
export function About() {
  const { about, portrait, personalGallery } = profile
  return (
    <Scene id="about" tone="ivory" backdrop={<SceneBackdrop tone="ivory" variant="b" />}>
      <SectionHeading index="01" eyebrow={about.eyebrow} id="about-title" title={about.title} />
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {portrait ? (
          <div className="lg:col-span-5">
            <Reveal>
              <figure className="mx-auto max-w-[19rem] sm:max-w-sm lg:mx-0 lg:max-w-[24rem]" data-testid="about-portrait">
                <div className="relative">
                  <span aria-hidden className="absolute -bottom-3 -right-3 h-[86%] w-[80%] rounded-[28px] bg-peach sm:-bottom-4 sm:-right-4" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-burgundy-dark shadow-float">
                    <Img
                      src={portrait.src}
                      alt={portrait.alt}
                      width={portrait.width}
                      height={portrait.height}
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 24rem, 19rem"
                      className="size-full object-cover"
                      style={{ objectPosition: portrait.position }}
                    />
                  </div>
                </div>
                <figcaption className="t-eyebrow mt-8 text-burgundy">
                  {profile.name} · {profile.title} · {profile.location}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        ) : null}
        <div className={portrait ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Reveal>
            <p className="t-lede text-burgundy">{about.lede}</p>
          </Reveal>
          <div className="mt-8 max-w-[68ch] space-y-5 text-ink-soft">
            {about.paragraphs.map((p) => (
              <Reveal key={p}>
                <p className="t-body-l">{p}</p>
              </Reveal>
            ))}
          </div>
          {about.attributes.length > 0 ? (
            <Reveal>
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Working style">
                {about.attributes.map((a) => (
                  <li key={a}>
                    <Tag>{a}</Tag>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </div>

      <ol className="mt-14 grid gap-4 md:grid-cols-3">
        {about.strengths.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 0.08}>
            <ParallaxLayer depth={i % 2 ? 10 : 18}>
              <div className="h-full rounded-[20px] border border-line bg-peach-soft p-6">
                <p className="t-eyebrow tabular-nums text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="t-heading-s mt-2">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
              </div>
            </ParallaxLayer>
          </Reveal>
        ))}
      </ol>

      {personalGallery && personalGallery.items.length > 0 ? (
        <section aria-labelledby="beyond-title" className="mt-16 md:mt-20" data-testid="beyond-the-build">
          <Reveal>
            <p className="t-eyebrow mb-3 text-burgundy">{personalGallery.eyebrow}</p>
            <h3 id="beyond-title" className="t-heading-m max-w-3xl">
              {personalGallery.title}
            </h3>
            {personalGallery.intro ? <p className="mt-3 max-w-2xl text-ink-soft">{personalGallery.intro}</p> : null}
          </Reveal>
          {/* A swipeable row on phones, three columns from tablet up. */}
          <ul
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable scroll region, so keyboard users can scroll it
            tabIndex={0}
            aria-label={personalGallery.eyebrow}
            className="-mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-3 outline-offset-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
          >
            {personalGallery.items.map((g, i) => (
              <Reveal as="li" key={g.src} delay={i * 0.08} className="w-[78%] shrink-0 snap-start md:w-auto">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-peach-soft">
                    <Img
                      src={g.src}
                      alt={g.alt}
                      width={g.width}
                      height={g.height}
                      sizes="(min-width: 768px) 30vw, 78vw"
                      className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out)] hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
                      style={{ objectPosition: g.position }}
                    />
                  </div>
                  <figcaption className="mt-3">
                    <span className="t-eyebrow block text-burgundy">{g.category}</span>
                    <span className="mt-1 block text-sm text-ink-soft">{g.caption}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}
    </Scene>
  )
}
