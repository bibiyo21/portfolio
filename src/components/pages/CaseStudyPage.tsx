import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { projects } from '../../lib/content-loader'
import type { ProjectItem } from '../../lib/content-schemas'
import { CASE_STUDIES_PATH, caseStudyPath } from '../../lib/routes'
import { Container } from '../layout/Container'
import { ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { Tag } from '../ui/Tag'
import { PageShell } from './PageShell'

export const caseStudyProjects = (): ProjectItem[] => projects.items.filter((p) => p.caseStudy)

function Block({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-line py-12 md:py-16">
      <p className="t-eyebrow mb-3 text-burgundy">{eyebrow}</p>
      <h2 id={`${id}-title`} className="t-heading-m max-w-3xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Cards({ items, tone }: { items: { title: string; text: string }[]; tone: 'plain' | 'good' | 'fix' }) {
  const border = tone === 'good' ? 'border-l-burgundy' : tone === 'fix' ? 'border-l-charcoal' : 'border-l-peach'
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((i) => (
        <li key={i.title} className={`rounded-[16px] border border-line border-l-4 bg-peach-soft p-5 md:p-6 ${border}`}>
          <h3 className="t-heading-s">{i.title}</h3>
          <p className="mt-2 text-ink-soft">{i.text}</p>
        </li>
      ))}
    </ul>
  )
}

/** One case-study page: what the system is, how it is built, and an honest review with a modernisation path. */
export function CaseStudyPage({ project }: { project: ProjectItem }) {
  const cs = project.caseStudy!
  const all = caseStudyProjects()
  const next = all[(all.findIndex((p) => p.id === project.id) + 1) % all.length]!
  return (
    <PageShell title={cs.seoTitle} description={cs.seoDescription}>
      <Container className="pb-16 pt-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="t-caption mb-8 text-ink-soft">
          <a href={CASE_STUDIES_PATH} className="inline-flex min-h-11 items-center gap-2 hover:text-burgundy">
            <ArrowLeft className="size-4" aria-hidden /> All case studies
          </a>
        </nav>

        <header>
          <p className="t-eyebrow mb-4 text-burgundy">Case study · Legacy project · Demo data</p>
          <h1 className="t-display-l max-w-4xl">{cs.headline}</h1>
          <p className="t-body-l mt-6 max-w-3xl text-ink-soft">{cs.lede}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
            {project.technologies.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#contact" arrow>
              Discuss a similar project
            </ButtonLink>
            <ButtonLink variant="secondary" href={CASE_STUDIES_PATH}>
              All case studies
            </ButtonLink>
          </div>
        </header>

        {cs.snapshot.length > 0 ? (
          <dl className="mt-12 grid gap-x-8 gap-y-5 rounded-[20px] border border-line bg-peach-soft p-6 md:grid-cols-[10rem_1fr] md:p-8">
            {cs.snapshot.map((s) => (
              <div key={s.label} className="contents">
                <dt className="t-eyebrow text-burgundy">{s.label}</dt>
                <dd className="text-ink-soft">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {project.gallery.length > 0 ? (
          <ul aria-label="Screenshots" className="mt-12 grid gap-6 md:grid-cols-2">
            {project.gallery.map((g, i) => (
              <li key={g.src} className={i === 0 ? 'md:col-span-2' : undefined}>
                <figure>
                  <div className="overflow-hidden rounded-[16px] border border-line bg-peach-soft">
                    <Img
                      src={g.src}
                      alt={g.alt}
                      width={g.width}
                      height={g.height}
                      priority={i === 0}
                      className="h-auto w-full"
                    />
                  </div>
                  {g.caption ? <figcaption className="mt-2 text-xs text-ink-soft">{g.caption}</figcaption> : null}
                </figure>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-12">
          {project.overview ? (
            <Block id="overview" eyebrow="Overview" title="What the system does">
              <p className="t-body-l max-w-3xl text-ink-soft">{project.overview}</p>
              {project.features.length > 0 ? (
                <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 text-ink-soft marker:text-burgundy">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </Block>
          ) : null}

          {cs.architecture.length > 0 ? (
            <Block id="architecture" eyebrow="Design" title="How it is built">
              <Cards items={cs.architecture} tone="plain" />
            </Block>
          ) : null}

          {cs.interfaces.length > 0 ? (
            <Block id="interfaces" eyebrow="API surface" title="The interfaces it exposes and calls">
              <dl className="grid gap-x-8 gap-y-5 md:grid-cols-[minmax(0,20rem)_1fr]">
                {cs.interfaces.map((i) => (
                  <div key={i.name} className="contents">
                    <dt className="font-mono text-sm font-medium text-burgundy [overflow-wrap:anywhere]">{i.name}</dt>
                    <dd className="text-ink-soft">{i.text}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}

          {cs.strengths.length > 0 ? (
            <Block id="strengths" eyebrow="Evaluation" title="What holds up">
              <Cards items={cs.strengths} tone="good" />
            </Block>
          ) : null}

          {cs.concerns.length > 0 ? (
            <Block id="concerns" eyebrow="Evaluation" title="What I would fix">
              <Cards items={cs.concerns} tone="fix" />
            </Block>
          ) : null}

          {cs.modernisation.length > 0 ? (
            <Block id="modernisation" eyebrow="Next steps" title="How I would modernise it">
              <ol className="max-w-3xl space-y-5">
                {cs.modernisation.map((m, i) => (
                  <li key={m.title} className="flex gap-4">
                    <span className="t-eyebrow mt-1 tabular-nums text-burgundy">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-ink-soft">
                      <span className="font-medium text-charcoal">{m.title}.</span> {m.text}
                    </p>
                  </li>
                ))}
              </ol>
            </Block>
          ) : null}

          {cs.verdict ? (
            <Block id="verdict" eyebrow="Verdict" title="Overall">
              <p className="t-body-l max-w-3xl rounded-[20px] bg-burgundy-dark p-6 text-on-dark-soft md:p-8">{cs.verdict}</p>
            </Block>
          ) : null}

          {project.techSpec.length > 0 ? (
            <Block id="spec" eyebrow="Reference" title="Technical specification">
              <dl className="grid gap-x-8 gap-y-4 md:grid-cols-[10rem_1fr]">
                {project.techSpec.map((g) => (
                  <div key={g.group} className="contents">
                    <dt className="font-medium">{g.group}</dt>
                    <dd className="text-ink-soft">{g.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}
        </div>

        {projects.caseStudiesPage?.reviewNote ? (
          <p className="t-caption mt-4 max-w-3xl border-l-2 border-burgundy pl-4 text-ink-soft">
            {projects.caseStudiesPage.reviewNote}
          </p>
        ) : null}

        <nav aria-label="More case studies" className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <ButtonLink variant="secondary" href={caseStudyPath(next.caseStudy!.slug)}>
            Next: {next.name} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/#contact" arrow>
            Get in touch
          </ButtonLink>
        </nav>
      </Container>
    </PageShell>
  )
}
