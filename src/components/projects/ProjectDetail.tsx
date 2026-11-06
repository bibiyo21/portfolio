import { ExternalLink } from 'lucide-react'
import type { ProjectItem } from '../../lib/content-schemas'
import { GithubIcon } from '../../lib/icons'
import { ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { Tag } from '../ui/Tag'
import { StatusChip } from './StatusChip'

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="t-eyebrow mb-3 text-burgundy">{title}</h3>
      <ul className="list-disc space-y-2 pl-5 text-ink-soft marker:text-burgundy">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

function Text({ title, text }: { title: string; text: string }) {
  if (!text) return null
  return (
    <div>
      <h3 className="t-eyebrow mb-3 text-burgundy">{title}</h3>
      <p className="max-w-[68ch] text-ink-soft">{text}</p>
    </div>
  )
}

/**
 * Detail dialog for projects without a dedicated scene. Every section renders only when the YAML has
 * verified content for it, so an unconfirmed field never appears. The status label and tags keep a personal
 * proof of concept from being mistaken for client work.
 */
export function ProjectDetail({ project }: { project: ProjectItem }) {
  return (
    <div>
      {project.statusLabel || project.tags.length > 0 ? (
        <ul className="mb-5 flex flex-wrap gap-2" aria-label="Project status">
          {project.statusLabel ? (
            <li>
              <span className="inline-flex items-center rounded-full bg-burgundy px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-ivory">
                {project.statusLabel}
              </span>
            </li>
          ) : null}
          {project.tags.map((t) => (
            <li key={t}>
              <Tag>{t}</Tag>
            </li>
          ))}
        </ul>
      ) : null}

      {project.thumbnail && project.gallery.length === 0 ? (
        <div className="mb-6 aspect-[3/2] overflow-hidden rounded-[20px] bg-peach-soft">
          <Img
            src={project.thumbnail.src}
            alt={project.thumbnail.alt}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            className="size-full object-cover object-top"
          />
        </div>
      ) : null}

      <p className="t-body-l max-w-[68ch] text-ink-soft">{project.overview || project.summary}</p>

      {project.technologies.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
          {project.technologies.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}

      {project.gallery.length > 0 ? (
        <ul className="mt-8 grid gap-6 md:grid-cols-2" aria-label="Screenshots">
          {project.gallery.map((g) => (
            <li key={g.src} className={g.width && g.height && g.height > g.width ? 'md:max-w-[280px]' : ''}>
              <figure>
                <div className="overflow-hidden rounded-[16px] border border-line bg-peach-soft">
                  <Img src={g.src} alt={g.alt} width={g.width} height={g.height} className="h-auto w-full" />
                </div>
                {g.caption ? <figcaption className="mt-2 text-xs text-ink-soft">{g.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Text title="Motivation" text={project.motivation} />
        <Text title="Intended users" text={project.intendedUsers} />
        <List title="Features visible in the demo" items={project.features} />
        <List title="Role and contribution" items={project.role} />
        <List title="Design and engineering decisions" items={project.decisions.map((d) => `${d.title}. ${d.text}`)} />
        <List title="Status and limitations" items={project.limitations} />
        <List title="What I learned" items={project.learned} />
        <List title="Outcome" items={project.outcome} />
      </div>

      {project.techSpec.length > 0 ? (
        <div className="mt-8">
          <h3 className="t-eyebrow mb-3 text-burgundy">Technical specification</h3>
          <dl className="grid gap-x-8 gap-y-4 md:grid-cols-[10rem_1fr]">
            {project.techSpec.map((g) => (
              <div key={g.group} className="contents">
                <dt className="font-medium text-charcoal">{g.group}</dt>
                <dd className="text-ink-soft">{g.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {project.approach.length > 0 ? (
        <div className="mt-8">
          <h3 className="t-eyebrow mb-3 text-burgundy">Architecture and approach</h3>
          <ul className="space-y-3">
            {project.approach.map((a) => (
              <li key={a.title} className="flex flex-wrap items-center gap-3">
                <StatusChip status={a.status} className="text-burgundy" />
                <span className="text-ink-soft">
                  <span className="font-medium text-charcoal">{a.title}.</span> {a.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.liveUrl || project.repoUrl ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {project.liveUrl ? (
            <ButtonLink href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="size-4" aria-hidden />
                {project.ctaLabel || 'Visit the live site'}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </ButtonLink>
          ) : null}
          {project.repoUrl ? (
            <ButtonLink variant="secondary" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <span className="inline-flex items-center gap-2">
                <GithubIcon className="size-4" aria-hidden /> Repository
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
