import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { ParallaxLayer } from '../scenes/ParallaxLayer'
import { Img } from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Tag } from '../ui/Tag'
import { profile } from '../../lib/content-loader'

export function About() {
  const { about } = profile
  return (
    <Scene id="about" tone="ivory" backdrop={<SceneBackdrop tone="ivory" variant="b" />}>
      <SectionHeading index="01" eyebrow={about.eyebrow} id="about-title" title={about.title} />
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
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
        <div className="lg:col-span-5">
          {profile.portrait ? (
            <Reveal className="mb-6">
              <div className="aspect-[4/5] max-w-sm overflow-hidden rounded-[28px] bg-burgundy-dark">
                <Img
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  className="size-full object-cover"
                />
              </div>
            </Reveal>
          ) : null}
          <ol className="space-y-4">
            {about.strengths.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08}>
                <ParallaxLayer depth={i % 2 ? 10 : 18}>
                  <div className="rounded-[20px] border border-line bg-peach-soft p-6">
                    <p className="t-eyebrow tabular-nums text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="t-heading-s mt-2">{s.title}</h3>
                    <p className="mt-2 text-ink-soft">{s.text}</p>
                  </div>
                </ParallaxLayer>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Scene>
  )
}
