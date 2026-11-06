import { ExternalLink } from 'lucide-react'
import type { ProjectItem } from '../../lib/content-schemas'
import { Button, ButtonLink } from '../ui/Button'
import { Img } from '../ui/Img'
import { Tag } from '../ui/Tag'

/**
 * Card for a personal side project or proof of concept. It is visibly different from the client-work cards
 * (dashed border, status label) so it is never mistaken for client work. The live link is the primary action
 * and opens safely in a new tab. A sample-data screenshot is shown when available, otherwise a decorative dot pattern that does not depict the app.
 */
export function PersonalProjectCard({ project, onOpen }: { project: ProjectItem; onOpen: () => void }) {
  return (
    <article
      data-testid="personal-card"
      className="relative flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-dashed border-burgundy/40 bg-peach-soft p-6 md:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-5 -right-5 grid grid-cols-6 gap-2.5 opacity-50 max-sm:hidden">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className={`size-3 rounded-full ${i % 5 === 2 ? 'bg-burgundy' : 'bg-peach'}`} />
        ))}
      </div>

      {project.thumbnail ? (
        <div className="relative -mx-6 -mt-6 mb-6 aspect-[16/9] overflow-hidden border-b-2 border-dashed border-burgundy/40 bg-peach md:-mx-8 md:-mt-8">
          <Img
            src={project.thumbnail.src}
            alt={project.thumbnail.alt}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            className="size-full object-cover object-top"
          />
        </div>
      ) : null}

      <ul className="relative flex flex-wrap items-center gap-2" aria-label="Project status">
        {project.statusLabel ? (
          <li>
            <span className="inline-flex items-center rounded-full bg-burgundy px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-ivory">
              {project.statusLabel}
            </span>
          </li>
        ) : null}
        {project.tags.map((t) => (
          <li key={t}>
            <Tag variant="outline" className="border-burgundy/40 text-burgundy-dark">
              {t}
            </Tag>
          </li>
        ))}
      </ul>

      <h4 className="t-heading-m relative mt-5">{project.name}</h4>
      {project.siteLabel ? <p className="t-caption relative mt-1 text-ink-soft">{project.siteLabel}</p> : null}
      <p className="relative mt-4 max-w-[62ch] text-ink-soft">{project.summary}</p>

      <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-6">
        {project.liveUrl ? (
          <ButtonLink href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 px-5 py-2.5">
            <span className="inline-flex items-center gap-2">
              <ExternalLink className="size-4" aria-hidden />
              {project.ctaLabel || 'Open Demo'}
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </ButtonLink>
        ) : null}
        <Button variant="secondary" onClick={onOpen} aria-haspopup="dialog" className="min-h-11 px-5 py-2.5">
          View details
        </Button>
      </div>
    </article>
  )
}
