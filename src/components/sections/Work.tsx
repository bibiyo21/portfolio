import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { PersonalProjectCard } from '../projects/PersonalProjectCard'
import { ProjectCard } from '../projects/ProjectCard'
import { ProjectDetail } from '../projects/ProjectDetail'
import { Modal } from '../ui/Modal'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { useScene } from '../../hooks/useScene'
import { projects } from '../../lib/content-loader'
import type { ProjectItem } from '../../lib/content-schemas'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/animations'

const ALL = 'All'

export function Work() {
  const { goTo } = useScene()
  const [filter, setFilter] = useState(ALL)
  const [selected, setSelected] = useState<ProjectItem | null>(null)
  const reduce = useReducedMotion()
  const family = projects.family

  // Client and technical work is listed first. Personal side projects get their own block below it.
  const featured = useMemo(() => projects.items.filter((p) => p.type !== 'personal'), [])
  const personal = useMemo(() => projects.items.filter((p) => p.type === 'personal'), [])
  const personalIntro = projects.personal

  const categories = useMemo(() => {
    const used = new Set(featured.map((p) => p.category))
    return [ALL, ...projects.categories.filter((c) => used.has(c))]
  }, [featured])
  const visible = useMemo(
    () => (filter === ALL ? featured : featured.filter((p) => p.category === filter)),
    [filter, featured],
  )

  return (
    <Scene id="work" tone="ivory" backdrop={<SceneBackdrop tone="ivory" />}>
      <SectionHeading
        layout="split"
        index="03"
        eyebrow={family?.eyebrow ?? 'Featured work'}
        id="work-title"
        title={family?.title ?? 'Featured work'}
        intro={family?.intro}
      />

      {family?.relationship ? (
        <Reveal>
          <p className="-mt-4 mb-10 max-w-2xl border-l-2 border-burgundy pl-5 text-ink-soft md:-mt-6 lg:ml-auto lg:max-w-[calc(5/12*100%-1.5rem)]">{family.relationship}</p>
        </Reveal>
      ) : null}

      {categories.length > 2 ? (
        <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === filter
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={active}
                className={cn(
                  'min-h-11 rounded-full px-5 text-xs font-medium uppercase tracking-[0.08em] transition-colors',
                  active
                    ? 'bg-burgundy text-ivory'
                    : 'border border-line-strong text-ink-soft hover:bg-peach-soft hover:text-charcoal',
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
      ) : null}

      <motion.ul layout={!reduce} className="grid gap-6 md:grid-cols-2 lg:grid-cols-12" data-testid="project-grid">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => {
            // Editorial rhythm: alternate 7/5 then 5/7 column spans on desktop.
            const isBig = (i % 2 === 0) === (Math.floor(i / 2) % 2 === 0)
            const span = isBig ? 'lg:col-span-7' : 'lg:col-span-5'
            return (
              <motion.li
                key={p.id}
                layout={!reduce}
                initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                transition={{ duration: 0.6, ease: ease.out, delay: Math.min(i, 4) * 0.08 }}
                className={span}
                data-testid="project-card"
              >
                <ProjectCard
                  project={p}
                  index={i}
                  large={isBig}
                  as={p.scene ? 'link' : 'button'}
                  href={p.scene ? `#${p.scene}` : undefined}
                  onOpen={() => (p.scene ? goTo(p.scene) : setSelected(p))}
                />
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 ? (
        <p className="text-ink-soft">No projects in this category yet.</p>
      ) : null}

      {personal.length > 0 ? (
        <section aria-labelledby="personal-projects-title" className="mt-16 md:mt-20" data-testid="personal-projects">
          <Reveal>
            <p className="t-eyebrow mb-4 text-burgundy">{personalIntro?.eyebrow ?? 'Personal project'}</p>
            <h3 id="personal-projects-title" className="t-heading-m max-w-3xl">
              {personalIntro?.title ?? 'Personal projects'}
            </h3>
            {personalIntro?.intro ? <p className="mt-4 max-w-2xl text-ink-soft">{personalIntro.intro}</p> : null}
          </Reveal>
          <ul className="mt-8 grid gap-6 lg:grid-cols-2">
            {personal.map((p) => (
              <Reveal as="li" key={p.id}>
                <PersonalProjectCard project={p} onOpen={() => setSelected(p)} />
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      <Reveal>
        <p className="mt-10 max-w-2xl text-sm text-ink-mute">
          More projects will be added here as they are cleared for publication.
        </p>
      </Reveal>

      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        title={selected?.name ?? ''}
        description={selected ? (selected.type === 'personal' ? 'Personal project · Proof of concept' : `${selected.category} project`) : undefined}
        size="lg"
      >
        {selected ? <ProjectDetail project={selected} /> : null}
      </Modal>
    </Scene>
  )
}
