import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Tag } from '../ui/Tag'
import { affiliations, experience } from '../../lib/content-loader'
import type { AffiliationItem, ExperienceRole } from '../../lib/content-schemas'
import { ease } from '../../lib/animations'

function hasDetails(r: ExperienceRole): boolean {
  return r.responsibilities.length > 0 || r.achievements.length > 0 || r.technologies.length > 0
}

const PREVIEW = 4

function RoleRow({ role }: { role: ExperienceRole }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const panelId = useId()
  // The first few contributions are always visible so the strongest evidence needs no click.
  const preview = role.responsibilities.slice(0, PREVIEW)
  const rest = role.responsibilities.slice(PREVIEW)
  const expandable = rest.length > 0 || role.achievements.length > 0 || role.technologies.length > 0
  const count = role.responsibilities.length + role.achievements.length

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="t-heading-s">{role.title}</h4>
          <p className="t-caption mt-1 tabular-nums text-ink-mute">{role.period}</p>
        </div>
        {expandable ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? 'Hide' : 'Show'} details for ${role.title}`}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-peach-soft px-4 text-sm font-medium text-burgundy-dark transition-colors hover:bg-peach"
          >
            {open ? 'Show fewer' : preview.length > 0 ? `All ${count} contributions` : count > 0 ? `${count} contributions` : 'Details'}
            <ChevronDown className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        ) : null}
      </div>
      {role.summary ? <p className="mt-3 max-w-[62ch] text-ink-soft">{role.summary}</p> : null}
      {preview.length > 0 ? (
        <ul className="mt-4 grid gap-x-10 gap-y-3 text-ink-soft md:grid-cols-2" data-testid="contribution-preview">
          {preview.map((r) => (
            <li key={r} className="border-l-2 border-burgundy/30 pl-4">
              {r}
            </li>
          ))}
        </ul>
      ) : null}
      <AnimatePresence initial={false}>
        {open && expandable ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.45, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-4">
              {rest.length > 0 ? (
                <ul className="grid gap-x-10 gap-y-3 text-ink-soft md:grid-cols-2">
                  {rest.map((r) => (
                    <li key={r} className="border-l-2 border-burgundy/30 pl-4">
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
              {role.achievements.length > 0 ? (
                <div>
                  <h5 className="t-eyebrow mb-2 text-burgundy">Achievements</h5>
                  <ul className="list-disc space-y-2 pl-5 text-ink-soft marker:text-burgundy">
                    {role.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {role.technologies.length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Technologies">
                  {role.technologies.map((t) => (
                    <li key={t}>
                      <Tag>{t}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function LeadershipRow({ item }: { item: AffiliationItem }) {
  return (
    <div className="mt-2 rounded-2xl border border-dashed border-burgundy/40 bg-peach-soft/60 p-5" data-testid="leadership">
      <p className="t-eyebrow text-burgundy">Leadership</p>
      <h4 className="t-heading-s mt-1">
        {item.role}, {item.name}
      </h4>
      {item.period ? <p className="t-caption mt-1 tabular-nums text-ink-mute">{item.period}</p> : null}
      {item.description ? <p className="mt-2 text-ink-soft">{item.description}</p> : null}
      {item.responsibilities.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft marker:text-burgundy">
          {item.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 80%', 'end 60%'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Scene id="experience" tone="ivory" backdrop={<SceneBackdrop tone="ivory" />}>
      <SectionHeading index="06" eyebrow="Experience" id="experience-title" title="A career across architecture and delivery" />
      <ol ref={listRef} className="relative space-y-6 pl-8 md:pl-14" data-testid="timeline">
        <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-line-strong md:left-[15px]" />
        <motion.span
          aria-hidden
          style={{ scaleY: reduce ? 1 : scaleY, transformOrigin: 'top' }}
          className="absolute bottom-2 left-[7px] top-2 w-px bg-burgundy md:left-[15px]"
        />
        {experience.groups.map((g, i) => {
          const leadership = affiliations.items.filter((a) => a.parentCompany === g.id)
          return (
            <Reveal as="li" key={g.id} className="relative" delay={Math.min(i, 3) * 0.05}>
              <span
                aria-hidden
                className="absolute -left-8 top-7 size-[15px] rounded-full border-[3px] border-ivory bg-burgundy md:-left-14 md:size-[19px]"
              />
              <article
                data-testid="company"
                className="rounded-[20px] border border-line bg-ivory p-6 transition-colors duration-300 hover:border-burgundy md:p-8"
              >
                <h3 className="t-heading-m">{g.company}</h3>
                {g.roles.some(hasDetails) ? (
                  <div className="mt-2 divide-y divide-line">
                    {g.roles.map((r) => (
                      <RoleRow key={r.id} role={r} />
                    ))}
                  </div>
                ) : (
                  // Roles without published details sit side by side, so an empty role does not take a full card.
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="compact-roles">
                    {g.roles.map((r) => (
                      <li key={r.id}>
                        <h4 className="t-heading-s">{r.title}</h4>
                        <p className="t-caption mt-1 tabular-nums text-ink-mute">{r.period}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {leadership.map((l) => (
                  <LeadershipRow key={l.id} item={l} />
                ))}
              </article>
            </Reveal>
          )
        })}
      </ol>
    </Scene>
  )
}
