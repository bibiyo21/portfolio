import { ArrowRight } from 'lucide-react'
import { projects } from '../../lib/content-loader'
import { caseStudyPath } from '../../lib/routes'
import { Container } from '../layout/Container'
import { ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { Tag } from '../ui/Tag'
import { PageShell } from './PageShell'

/** Index of every case study: the two recent GTI projects (their scenes stay on the home page) and the legacy reviews. */
export function CaseStudiesIndex() {
  const page = projects.caseStudiesPage!
  const recent = projects.items.filter((p) => p.scene)
  const legacy = projects.items.filter((p) => p.caseStudy)
  return (
    <PageShell title={page.seoTitle} description={page.seoDescription}>
      <Container className="pb-20 pt-12 md:pt-16">
        <header>
          <p className="t-eyebrow mb-4 text-burgundy">{page.eyebrow}</p>
          <h1 className="t-display-l max-w-4xl">{page.title}</h1>
          <p className="t-body-l mt-6 max-w-3xl text-ink-soft">{page.intro}</p>
        </header>

        <section aria-labelledby="recent-title" className="mt-14">
          <h2 id="recent-title" className="t-heading-m">
            Recent projects
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {recent.map((p) => (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-peach-soft">
                {p.thumbnail ? (
                  <Img src={p.thumbnail.src} alt={p.thumbnail.alt} width={p.thumbnail.width} height={p.thumbnail.height} className="aspect-[16/10] w-full object-cover object-top" />
                ) : null}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="t-heading-m">{p.name}</h3>
                  <p className="text-ink-soft">{p.summary}</p>
                  <div className="mt-auto pt-3">
                    <ButtonLink href={`/#${p.scene}`} arrow>
                      Read the case study
                    </ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="legacy-title" className="mt-16">
          <h2 id="legacy-title" className="t-heading-m">
            Legacy systems, reviewed
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {legacy.map((p) => (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-[20px] border-2 border-dashed border-burgundy/40 bg-peach-soft">
                {p.thumbnail ? (
                  <Img src={p.thumbnail.src} alt={p.thumbnail.alt} width={p.thumbnail.width} height={p.thumbnail.height} className="aspect-[16/10] w-full object-cover object-top" />
                ) : null}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <ul className="flex flex-wrap gap-2" aria-label="Project status">
                    <li>
                      <Tag>Legacy project</Tag>
                    </li>
                    <li>
                      <Tag>Demo data</Tag>
                    </li>
                  </ul>
                  <h3 className="t-heading-m">{p.name}</h3>
                  <p className="text-ink-soft">{p.summary}</p>
                  <div className="mt-auto pt-3">
                    <ButtonLink href={caseStudyPath(p.caseStudy!.slug)} arrow>
                      Read the review
                    </ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="t-caption mt-8 max-w-3xl border-l-2 border-burgundy pl-4 text-ink-soft">{page.reviewNote}</p>
        </section>

        <div className="mt-14">
          <ButtonLink variant="secondary" href="/#contact">
            Discuss your project <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </Container>
    </PageShell>
  )
}
