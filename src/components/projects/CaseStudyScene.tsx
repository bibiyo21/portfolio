import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { ParallaxLayer } from '../scenes/ParallaxLayer'
import { Accordion, type AccordionItem } from '../ui/Accordion'
import { ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { ImageReveal } from '../ui/ImageReveal'
import { Reveal } from '../ui/Reveal'
import { Tag } from '../ui/Tag'
import { StatusChip } from './StatusChip'
import { useScene } from '../../hooks/useScene'
import { projects } from '../../lib/content-loader'
import type { ProjectItem } from '../../lib/content-schemas'
import { GithubIcon } from '../../lib/icons'
import type { SceneTone } from '../../lib/scenes'
import { cn } from '../../lib/cn'

/**
 * Dedicated case-study scene. `theme` changes the whole treatment (colour, layout direction,
 * motif) so related case studies stay clearly distinct. Sections render only when content exists.
 */
export function CaseStudyScene({ project, tone, number }: { project: ProjectItem; tone: SceneTone; number: string }) {
  const { goTo } = useScene()
  const dark = tone === 'dark'
  const mirrored = project.theme === 'north'
  const family = projects.family
  const siblings = projects.items.filter((p) => p.scene)
  const caseIndex = siblings.findIndex((p) => p.id === project.id)

  const text = dark ? 'text-on-dark-soft' : 'text-burgundy-dark/80'
  const accent = dark ? 'text-peach' : 'text-burgundy'

  const sections: AccordionItem[] = []
  if (project.context)
    sections.push({ id: 'context', title: 'Problem and context', content: <p>{project.context}</p> })
  if (project.role.length > 0)
    sections.push({
      id: 'role',
      title: 'Role and contribution',
      content: (
        <ul className="list-disc space-y-2 pl-5 marker:text-current">
          {project.role.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    })
  if (project.approach.length > 0)
    sections.push({
      id: 'approach',
      title: 'Architecture and approach',
      content: (
        <div>
          <ul className="space-y-3">
            {project.approach.map((a) => (
              <li key={a.title} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                <StatusChip status={a.status} className="shrink-0 self-start" />
                <span>
                  <span className="font-medium">{a.title}.</span> {a.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm opacity-80">
            Status labels distinguish delivered work from proposed or planned architecture.
          </p>
        </div>
      ),
    })
  if (project.technologies.length > 0)
    sections.push({
      id: 'tech',
      title: 'Technology',
      content: (
        <ul className="flex flex-wrap gap-2" aria-label="Technology stack">
          {project.technologies.map((t) => (
            <li key={t}>
              <Tag variant={dark ? 'dark' : 'outline'}>{t}</Tag>
            </li>
          ))}
        </ul>
      ),
    })
  if (project.challenges.length > 0)
    sections.push({
      id: 'challenges',
      title: 'Challenges and decisions',
      content: (
        <ul className="space-y-3">
          {project.challenges.map((c) => (
            <li key={c.title}>
              <span className="font-medium">{c.title}.</span> {c.text}
            </li>
          ))}
        </ul>
      ),
    })
  if (project.outcome.length > 0)
    sections.push({
      id: 'outcome',
      title: 'Outcome',
      content: (
        <ul className="list-disc space-y-2 pl-5">
          {project.outcome.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      ),
    })

  const links: ReactNode =
    project.liveUrl || project.repoUrl ? (
      <div className="mt-6 flex flex-wrap gap-3">
        {project.liveUrl ? (
          <ButtonLink variant={dark ? 'onDark' : 'primary'} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" aria-hidden /> Visit the live site
          </ButtonLink>
        ) : null}
        {project.repoUrl ? (
          <ButtonLink variant={dark ? 'onDarkOutline' : 'secondary'} href={project.repoUrl} target="_blank" rel="noopener noreferrer">
            <GithubIcon className="size-4" aria-hidden /> Repository
          </ButtonLink>
        ) : null}
      </div>
    ) : null

  return (
    <Scene
      id={project.scene ?? project.id}
      tone={tone}
      backdrop={<SceneBackdrop tone={tone} variant={mirrored ? 'b' : 'a'} />}
    >
      <div className={cn('grid gap-10 lg:grid-cols-12 lg:gap-14', mirrored && 'lg:[&>*:first-child]:order-2')}>
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:col-span-5 lg:self-start">
          <ParallaxLayer depth={26}>
            <ImageReveal>
              <figure className="relative">
              <div
                className={cn(
                  'overflow-hidden rounded-[28px] border',
                  dark ? 'border-ivory/15 bg-burgundy' : 'border-burgundy/20 bg-ivory',
                )}
              >
                <div className={cn('flex items-center gap-1.5 px-4 py-3', dark ? 'bg-burgundy-deep/60' : 'bg-peach-soft')} aria-hidden>
                  <span className="size-2 rounded-full bg-peach" />
                  <span className="size-2 rounded-full bg-peach/60" />
                  <span className="size-2 rounded-full bg-peach/30" />
                </div>
                <Img
                  src={project.thumbnail.src}
                  alt={project.thumbnail.alt}
                  width={project.thumbnail.width}
                  height={project.thumbnail.height}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className={cn('mt-3 text-xs', dark ? 'text-on-dark-mute' : 'text-burgundy-dark/70')}>
                Illustrative artwork. Real screenshots will replace it once cleared for publication.
              </figcaption>
            </figure>
            </ImageReveal>
          </ParallaxLayer>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className={cn('t-eyebrow mb-4', accent)}>
              {number} — Case study {caseIndex + 1} of {siblings.length}
              {family ? ` · ${family.title}` : ''}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id={`${project.scene ?? project.id}-title`} className="t-display-l">
                {project.name}
              </h2>
              {project.siteLabel ? (
                <Tag variant={dark ? 'dark' : 'outline'} className={dark ? '' : 'border-burgundy/40 text-burgundy-dark'}>
                  {project.siteLabel}
                </Tag>
              ) : null}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={cn('t-lede mt-5 max-w-2xl', text)}>{project.summary}</p>
          </Reveal>

          {siblings.length > 1 ? (
            <Reveal delay={0.12}>
              <nav aria-label={`GTI case studies, ${project.name} open`} className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                {siblings.map((s, i) => (
                  <span key={s.id} className="inline-flex items-center gap-2">
                    {i > 0 ? (
                      <span aria-hidden className={accent}>
                        ⇄
                      </span>
                    ) : null}
                    {s.id === project.id ? (
                      <span
                        aria-current="true"
                        className={cn('rounded-full px-3 py-1 font-medium', dark ? 'bg-peach text-burgundy-dark' : 'bg-burgundy text-ivory')}
                      >
                        {s.name}
                      </span>
                    ) : (
                      <a
                        href={`#${s.scene}`}
                        onClick={(e) => {
                          e.preventDefault()
                          goTo(s.scene!)
                        }}
                        className={cn(
                          'inline-flex min-h-11 items-center rounded-full border px-3',
                          dark ? 'border-ivory/30 hover:bg-ivory/10' : 'border-burgundy/40 hover:bg-ivory/50',
                        )}
                      >
                        {s.name}
                      </a>
                    )}
                  </span>
                ))}
              </nav>
            </Reveal>
          ) : null}

          {project.overview ? (
            <Reveal delay={0.15}>
              <p className={cn('mt-6 max-w-[68ch]', text)}>{project.overview}</p>
            </Reveal>
          ) : null}

          <Reveal delay={0.2} className="mt-8">
            <Accordion items={sections} multiple defaultOpen={['role']} tone={dark ? 'dark' : 'peach'} headingLevel={3} />
            {links}
          </Reveal>
        </div>
      </div>
    </Scene>
  )
}
