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

/** Modal body for projects without a dedicated scene. Sections render only when content exists. */
export function ProjectDetail({ project }: { project: ProjectItem }) {
  return (
    <div>
      <div className="aspect-[3/2] overflow-hidden rounded-[20px] bg-peach-soft">
        <Img
          src={project.thumbnail.src}
          alt={project.thumbnail.alt}
          width={project.thumbnail.width}
          height={project.thumbnail.height}
          className="size-full object-cover"
        />
      </div>
      <p className="t-body-l mt-6 max-w-[68ch] text-ink-soft">{project.overview || project.summary}</p>
      {project.technologies.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <List title="Role and contribution" items={project.role} />
        <List title="Outcome" items={project.outcome} />
      </div>
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
              <ExternalLink className="size-4" aria-hidden /> Live website
            </ButtonLink>
          ) : null}
          {project.repoUrl ? (
            <ButtonLink variant="secondary" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" aria-hidden /> Repository
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
