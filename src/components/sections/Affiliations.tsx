import { ExternalLink, ImageOff, MapPin } from 'lucide-react'
import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { Img } from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { affiliations } from '../../lib/content-loader'
import { cn } from '../../lib/cn'
import type { AffiliationItem } from '../../lib/content-schemas'

/**
 * Standalone affiliations (items not nested under an employer). Production shows published items only.
 * The dev server also shows drafts, clearly labelled, so the owner can preview an entry before confirming it.
 */
export function visibleAffiliations(items: AffiliationItem[], showDrafts: boolean): AffiliationItem[] {
  return items.filter((a) => !a.parentCompany && (a.published || showDrafts))
}

/** The organisation's official logo, unaltered, or a labelled placeholder while the file is pending. */
export function LogoTile({ item }: { item: AffiliationItem }) {
  if (!item.logo) {
    return (
      <div
        role="img"
        aria-label={`${item.name} logo pending`}
        data-testid="affiliation-logo-pending"
        className="grid aspect-square w-full max-w-[16rem] place-items-center rounded-2xl border-2 border-dashed border-burgundy/40 bg-ivory p-6 text-center"
      >
        <div className="flex flex-col items-center gap-3 text-burgundy">
          <ImageOff className="size-8" aria-hidden />
          <span className="t-eyebrow">Logo pending</span>
          <span className="t-caption text-ink-mute">{item.name}</span>
        </div>
      </div>
    )
  }
  return (
    <Img
      src={item.logo}
      alt={item.logoAlt ?? `${item.name} logo`}
      width={item.logoWidth ?? 512}
      height={item.logoHeight ?? 512}
      data-testid="affiliation-logo"
      className="aspect-square w-full max-w-[16rem] rounded-2xl object-contain shadow-float transition-transform duration-500 group-hover:scale-[1.03]"
    />
  )
}

function AffiliationCard({ item }: { item: AffiliationItem }) {
  const draft = !item.published
  const link = item.links.website ?? item.links.facebook ?? item.url
  const linkPlace = item.links.website || !item.links.facebook ? 'the web' : 'Facebook'
  const titleId = `affiliation-${item.id}-title`
  const kicker = [item.relationship || 'Affiliation', item.period].filter(Boolean).join(' · ')

  return (
    <article
      aria-labelledby={titleId}
      data-testid={`affiliation-${item.id}`}
      data-draft={draft || undefined}
      className={cn(
        'group grid overflow-hidden rounded-[28px] bg-ivory text-charcoal transition-colors duration-300 lg:grid-cols-12',
        draft ? 'border-2 border-dashed border-peach' : 'border border-ivory/15 hover:border-peach',
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 bg-peach-soft p-8 text-center transition-colors duration-300 group-hover:bg-peach md:p-12 lg:col-span-5">
        <LogoTile item={item} />
        {item.logo && item.links.facebook ? (
          <p className="t-caption text-ink-mute">Official logo, from the studio’s Facebook page</p>
        ) : null}
      </div>

      <div className="flex flex-col p-6 md:p-10 lg:col-span-7 lg:p-12">
        {draft ? <p className="t-eyebrow mb-4 text-burgundy">Draft · not published · awaiting owner confirmation</p> : null}
        <p className="t-eyebrow text-burgundy">{kicker}</p>
        <h3 id={titleId} className="t-heading-m mt-3">
          {item.name}
        </h3>
        {item.tagline ? <p className="mt-2 font-display text-lg text-burgundy">{item.tagline}</p> : null}
        {item.role ? <p className="mt-1 text-ink-soft">{item.role}</p> : null}
        {item.location ? (
          <p className="t-caption mt-3 inline-flex items-center gap-1.5 text-ink-mute">
            <MapPin className="size-4" aria-hidden />
            {item.location}
          </p>
        ) : null}
        {item.description ? <p className="t-body-l mt-5 text-ink-soft">{item.description}</p> : null}

        {item.services.length > 0 ? (
          <div className="mt-6">
            <h4 className="t-eyebrow text-ink-mute">Services</h4>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${item.name} services`}>
              {item.services.map((s) => (
                <li key={s} className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-charcoal">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {link ? (
          <div className="mt-8 border-t border-line pt-6">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-burgundy px-6 py-3.5 text-[0.9375rem] font-medium leading-none text-ivory transition-colors duration-200 hover:bg-burgundy-hover active:translate-y-px active:bg-burgundy-dark"
            >
              <span>
                Visit {item.name} on {linkPlace}
              </span>
              <ExternalLink className="size-4 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden />{' '}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function Affiliations({ showDrafts = import.meta.env.DEV }: { showDrafts?: boolean }) {
  const { section } = affiliations
  const items = visibleAffiliations(affiliations.items, showDrafts)
  return (
    <Scene id="affiliations" tone="dark" backdrop={<SceneBackdrop tone="dark" variant="a" />}>
      <SectionHeading
        index="10"
        eyebrow={section.eyebrow}
        id="affiliations-title"
        title={section.title}
        intro={section.intro || undefined}
        tone="dark"
        layout="split"
      />
      {items.length > 0 ? (
        <ul className="grid gap-6" data-testid="affiliations">
          {items.map((a, i) => (
            <Reveal as="li" key={a.id} delay={0.08 * i}>
              <AffiliationCard item={a} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="t-body-l text-on-dark-soft">No affiliations are listed yet.</p>
      )}
    </Scene>
  )
}
