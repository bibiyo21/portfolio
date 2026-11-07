import { ExternalLink, Handshake } from 'lucide-react'
import { Img } from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { affiliations } from '../../lib/content-loader'
import type { AffiliationItem } from '../../lib/content-schemas'

/**
 * Standalone affiliations (items not nested under an employer). Production shows published items only.
 * The dev server also shows drafts, clearly labelled, so the owner can preview an entry before confirming it.
 */
export function visibleAffiliations(items: AffiliationItem[], showDrafts: boolean): AffiliationItem[] {
  return items.filter((a) => !a.parentCompany && (a.published || showDrafts))
}

export function Affiliations({ showDrafts = import.meta.env.DEV }: { showDrafts?: boolean }) {
  const items = visibleAffiliations(affiliations.items, showDrafts)
  if (items.length === 0) return null
  return (
    <Reveal className="lg:col-span-12" delay={0.16}>
      <section aria-labelledby="affiliations-title" className="rounded-[20px] border border-line bg-ivory p-6 md:p-8" data-testid="affiliations">
        <div className="flex items-center gap-3 text-burgundy">
          <Handshake className="size-6" aria-hidden />
          <h3 id="affiliations-title" className="t-heading-s text-charcoal">
            Affiliations
          </h3>
        </div>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {items.map((a) => {
            const draft = !a.published
            const link = a.links.website ?? a.links.facebook ?? a.url
            return (
              <li
                key={a.id}
                className={draft ? 'rounded-2xl border-2 border-dashed border-burgundy/40 p-5' : 'rounded-2xl border border-line p-5'}
                data-draft={draft || undefined}
              >
                {draft ? (
                  <p className="t-eyebrow mb-3 text-burgundy">Draft · not published · awaiting owner confirmation</p>
                ) : null}
                <div className="flex items-start gap-4">
                  {a.logo && !draft ? (
                    <Img src={a.logo} alt={a.logoAlt ?? ''} width={56} height={56} className="size-14 shrink-0 rounded-xl object-contain" />
                  ) : null}
                  <div>
                    {a.relationship && !a.relationship.includes('CONFIRM_WITH_OWNER') ? (
                      <p className="t-caption text-ink-mute">{a.relationship}</p>
                    ) : null}
                    <p className="font-medium">{a.name}</p>
                    {a.role ? <p className="text-sm text-ink-soft">{a.role}</p> : null}
                    {a.description ? <p className="mt-2 text-sm text-ink-soft">{a.description}</p> : null}
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-burgundy"
                      >
                        {a.name} on {a.links.website ? 'the web' : 'Facebook'}
                        <ExternalLink className="size-4" aria-hidden />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </Reveal>
  )
}
