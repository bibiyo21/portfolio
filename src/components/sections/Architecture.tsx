import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { ArchitectureDiagram } from '../diagrams/ArchitectureDiagram'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { philosophy } from '../../lib/content-loader'

export function Architecture() {
  return (
    <Scene id="architecture" tone="dark" backdrop={<SceneBackdrop tone="dark" variant="b" />}>
      <SectionHeading
        layout="split"
        index="07"
        eyebrow="Architecture"
        id="architecture-title"
        title={philosophy.heading}
        intro={philosophy.intro}
        tone="dark"
      />
      {philosophy.principles.length > 0 ? (
        <ul className="mb-12 grid gap-4 md:grid-cols-3">
          {philosophy.principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.07}>
              <div className="h-full rounded-[20px] border border-ivory/12 bg-ivory/[0.04] p-5">
                <h3 className="t-heading-s text-ivory">{p.title}</h3>
                <p className="mt-1 text-sm text-on-dark-soft">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      ) : null}
      <ArchitectureDiagram />
    </Scene>
  )
}
