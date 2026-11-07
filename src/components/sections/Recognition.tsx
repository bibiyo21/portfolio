import { Award, BadgeCheck, GraduationCap } from 'lucide-react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Affiliations } from './Affiliations'
import { awards, certifications, education } from '../../lib/content-loader'

export function Recognition() {
  return (
    <Scene id="recognition" tone="soft" backdrop={<SceneBackdrop tone="soft" variant="b" />}>
      <SectionHeading index="09" eyebrow="Recognition" id="recognition-title" title="Education, certifications and awards" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          {education.items.length > 0 ? (
            <Reveal>
              <section aria-labelledby="education-title" className="rounded-[20px] border border-line bg-ivory p-6 md:p-8">
                <div className="flex items-center gap-3 text-burgundy">
                  <GraduationCap className="size-6" aria-hidden />
                  <h3 id="education-title" className="t-heading-s text-charcoal">
                    Education
                  </h3>
                </div>
                <ul className="mt-5 space-y-5">
                  {education.items.map((e) => (
                    <li key={e.id}>
                      <p className="font-medium">{e.program}</p>
                      <p className="text-ink-soft">{e.institution}</p>
                      <p className="t-caption mt-1 tabular-nums text-ink-mute">{e.period}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ) : null}
          {certifications.items.length > 0 ? (
            <Reveal delay={0.08}>
              <section aria-labelledby="certs-title" className="rounded-[20px] border border-line bg-ivory p-6 md:p-8">
                <div className="flex items-center gap-3 text-burgundy">
                  <BadgeCheck className="size-6" aria-hidden />
                  <h3 id="certs-title" className="t-heading-s text-charcoal">
                    Certifications
                  </h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {certifications.items.map((c) => (
                    <li key={c.id} className="border-l-2 border-burgundy pl-4">
                      {c.name}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ) : null}
        </div>

        {awards.items.length > 0 ? (
          <Reveal className="lg:col-span-7" delay={0.12}>
            <section aria-labelledby="awards-title" className="h-full rounded-[20px] border border-line bg-ivory p-6 md:p-8">
              <div className="flex items-center gap-3 text-burgundy">
                <Award className="size-6" aria-hidden />
                <h3 id="awards-title" className="t-heading-s text-charcoal">
                  Awards and recognition
                </h3>
              </div>
              <ol className="mt-5 divide-y divide-line" data-testid="awards">
                {awards.items.map((a) => (
                  <li key={a.id} className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
                    <p className="t-caption tabular-nums text-burgundy">{a.when.join(' · ')}</p>
                    <div>
                      <p className="font-medium">{a.title}</p>
                      {a.context ? <p className="text-sm text-ink-soft">{a.context}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        ) : null}
        <Affiliations />
      </div>
    </Scene>
  )
}
