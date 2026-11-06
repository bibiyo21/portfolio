import { ArrowUpRight } from 'lucide-react'
import type { ProjectItem } from '../../lib/content-schemas'
import { cn } from '../../lib/cn'
import { Img } from '../ui/Img'
import { Tag } from '../ui/Tag'

const themeStyles: Record<ProjectItem['theme'], string> = {
  main: 'border-burgundy-dark/40 bg-burgundy-dark text-ivory hover:border-peach',
  north: 'border-burgundy/25 bg-peach text-burgundy-dark hover:border-burgundy',
  default: 'border-line bg-peach-soft text-charcoal hover:border-burgundy',
}

/**
 * Entry card for a project. It is a button (opens a detail dialog) or, when the project has a
 * dedicated scene, a link to that scene. The caller supplies the matching handler.
 */
export function ProjectCard({
  project,
  index,
  large,
  as = 'button',
  href,
  onOpen,
}: {
  project: ProjectItem
  index: number
  large: boolean
  as?: 'button' | 'link'
  href?: string
  onOpen: () => void
}) {
  const dark = project.theme === 'main'
  const body = (
    <>
      <div className={cn('relative overflow-hidden', large ? 'aspect-[3/2]' : 'aspect-[4/3]')}>
        <Img
          src={project.thumbnail.src}
          alt={project.thumbnail.alt}
          width={project.thumbnail.width}
          height={project.thumbnail.height}
          className="size-full object-cover transition-transform duration-[700ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
        />
        <span className="absolute right-4 top-4 grid size-11 translate-x-1.5 -translate-y-1.5 place-items-center rounded-full bg-ivory text-burgundy opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('t-eyebrow tabular-nums', dark ? 'text-peach' : 'text-burgundy')}>
            {String(index + 1).padStart(2, '0')}
          </span>
          {project.siteLabel ? (
            <span className={cn('t-caption', dark ? 'text-on-dark-soft' : 'text-ink-soft')}>{project.siteLabel}</span>
          ) : null}
        </div>
        <h3 className="t-heading-m">{project.name}</h3>
        <p className={dark ? 'text-on-dark-soft' : 'text-ink-soft'}>{project.summary}</p>
        {project.technologies.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {project.technologies.slice(0, 4).map((t) => (
              <Tag key={t} variant={dark ? 'dark' : 'outline'}>
                {t}
              </Tag>
            ))}
          </div>
        ) : null}
        {as === 'link' ? (
          <span className={cn('mt-2 text-sm font-medium', dark ? 'text-peach' : 'text-burgundy')}>
            Read the case study
          </span>
        ) : null}
      </div>
    </>
  )
  const cls = cn(
    'group relative flex h-full w-full flex-col overflow-hidden border text-left transition-colors duration-300',
    large ? 'rounded-[28px]' : 'rounded-[20px]',
    themeStyles[project.theme],
  )
  if (as === 'link') {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          onOpen()
        }}
        className={cls}
      >
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" className={cls}>
      {body}
    </button>
  )
}
