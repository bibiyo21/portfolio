import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { SkillTag } from '../ui/SkillTag'
import { useScene } from '../../hooks/useScene'
import { profile, skills } from '../../lib/content-loader'
import { getIcon } from '../../lib/icons'
import { cn } from '../../lib/cn'

export function Expertise() {
  const { capabilities } = profile
  const { goTo } = useScene()
  const [tab, setTab] = useState(skills.categories[0]?.id ?? '')
  const current = skills.categories.find((c) => c.id === tab) ?? skills.categories[0]!

  return (
    <Scene id="expertise" tone="soft" backdrop={<SceneBackdrop tone="soft" />}>
      <SectionHeading
        layout="split"
        index="02"
        eyebrow={capabilities.eyebrow}
        id="expertise-title"
        title={capabilities.title}
        intro={capabilities.intro}
      />

      {/* On phones the cards become a swipeable row, so eight cards do not stack into several screens. */}
      <ul
        tabIndex={0}
        aria-label="Capabilities"
        data-testid="capability-list"
        className="-mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-3 outline-offset-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4"
      >
        {capabilities.items.map((c, i) => (
          <Reveal as="li" key={c.id} delay={(i % 4) * 0.07} className="w-[82%] shrink-0 snap-start sm:w-auto">
            <article
              data-testid="capability-card"
              className="group flex h-full flex-col rounded-[20px] border border-line bg-ivory p-5 transition-colors xl:p-6 duration-300 hover:border-burgundy"
            >
              <p className="t-eyebrow tabular-nums text-burgundy">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="t-heading-s mt-2">{c.title}</h3>
              <p className="mt-2 text-ink-soft">{c.text}</p>
              {c.technologies.length > 0 ? (
                // A compact mono line instead of pills: the skills explorer below holds the full tag lists.
                <ul
                  className="mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t border-line pt-3 font-mono text-[0.72rem] tracking-[0.02em] text-burgundy"
                  aria-label={`${c.title} technologies`}
                >
                  {c.technologies.map((t, ti) => (
                    <li key={t}>
                      {t}
                      {ti < c.technologies.length - 1 ? <span aria-hidden className="ml-2 text-ink-mute">/</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {c.link ? (
                <a
                  href={c.link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(c.link!.href.slice(1))
                  }}
                  className="link-draw mt-auto inline-flex min-h-11 items-center self-start pt-3 text-sm font-medium text-burgundy"
                >
                  {c.link.label}
                </a>
              ) : null}
            </article>
          </Reveal>
        ))}
      </ul>

      <div className="mt-12">
        <Reveal>
          <h3 className="t-heading-m">Skills explorer</h3>
          <p className="mt-3 max-w-2xl text-ink-soft">{skills.intro}</p>
        </Reveal>
        <Tabs.Root value={tab} onValueChange={setTab} className="mt-8">
          <Tabs.List aria-label="Skill categories" className="flex flex-wrap gap-2">
            {skills.categories.map((c) => (
              <Tabs.Trigger
                key={c.id}
                value={c.id}
                className={cn(
                  'min-h-11 rounded-full px-4 text-sm font-medium transition-colors',
                  c.kind === 'exploration' ? 'border border-dashed border-burgundy/50' : 'border border-line-strong',
                  'text-ink-soft hover:bg-ivory data-[state=active]:border-burgundy data-[state=active]:bg-burgundy data-[state=active]:text-ivory',
                )}
              >
                {c.title}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {skills.categories.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <Tabs.Content
                key={c.id}
                value={c.id}
                className="mt-6 rounded-[20px] border border-line bg-ivory p-6 outline-none md:p-8"
                data-testid="skill-panel"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-peach-soft text-burgundy">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <div>
                    <h4 className="t-heading-s">{c.title}</h4>
                    <p className="mt-1 text-ink-soft">{c.description}</p>
                  </div>
                </div>
                {c.kind === 'exploration' ? (
                  <p className="mt-4 inline-block rounded-full border border-dashed border-burgundy/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-burgundy">
                    Current interests, not delivery experience
                  </p>
                ) : null}
                <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${c.title} skills`}>
                  {c.skills.map((s) => (
                    <SkillTag key={s.name} name={s.name} interest={c.kind === 'exploration'} />
                  ))}
                </ul>
                <p className="mt-6 max-w-[68ch] border-t border-line pt-4 text-sm text-ink-soft">
                  <span className="font-medium text-burgundy">Why it matters: </span>
                  {c.relation}
                </p>
              </Tabs.Content>
            )
          })}
        </Tabs.Root>
        <span className="sr-only" aria-live="polite">
          Showing {current.title}
        </span>
      </div>
    </Scene>
  )
}
