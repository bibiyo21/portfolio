import * as Tabs from '@radix-ui/react-tabs'
import { Maximize2 } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type { ProjectItem } from '../../lib/content-schemas'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Img } from '../ui/Img'
import { ImageReveal } from '../ui/ImageReveal'
import { Modal } from '../ui/Modal'

type Preview = NonNullable<ProjectItem['preview']>

const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Real screenshots of a live site: a desktop browser frame with a phone overlapping it, and a dialog
 * that shows the whole homepage (desktop or mobile) in a scrollable frame. Full-page images only load
 * when the dialog is opened.
 */
export function SitePreview({ project, dark }: { project: ProjectItem; dark: boolean }) {
  const preview = project.preview as Preview
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('desktop')
  const host = project.liveUrl ? new URL(project.liveUrl).host : ''

  return (
    <div>
      <div className="relative pb-12 pr-6 sm:pr-10">
        {/* Both frames drift on small opposite orbits. The orbit sits outside the reveal so its clip never crops it. */}
        <div className="orbit" style={{ '--orbit-r': '5px', '--orbit-t': '16s' } as CSSProperties}>
        <ImageReveal>
          <div
            className={cn(
              'overflow-hidden rounded-[20px] border shadow-float',
              dark ? 'border-ivory/15 bg-burgundy-deep' : 'border-burgundy/20 bg-ivory',
            )}
            data-testid="desktop-preview"
          >
            <div className={cn('flex items-center gap-3 px-4 py-2.5', dark ? 'bg-burgundy-deep' : 'bg-peach-soft')}>
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2 rounded-full bg-peach" />
                <span className="size-2 rounded-full bg-peach/60" />
                <span className="size-2 rounded-full bg-peach/30" />
              </span>
              {host ? (
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate rounded-full px-3 py-0.5 text-center font-mono text-[0.7rem]',
                    dark ? 'bg-ivory/10 text-on-dark-soft' : 'bg-ivory text-ink-soft',
                  )}
                >
                  {host}
                </span>
              ) : null}
            </div>
            <Img
              src={preview.desktop.src}
              srcSet={preview.desktop.srcSet}
              sizes="(min-width: 1024px) 40vw, 90vw"
              alt={preview.desktop.alt}
              width={preview.desktop.width}
              height={preview.desktop.height}
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </div>
        </ImageReveal>
        </div>

        <div
          style={{ '--orbit-r': '8px', '--orbit-t': '11s' } as CSSProperties}
          className={cn(
            'orbit-reverse absolute bottom-0 right-0 w-[27%] min-w-[88px] max-w-[150px] overflow-hidden rounded-[18px] border-[5px] shadow-float',
            dark ? 'border-burgundy-deep bg-burgundy-deep' : 'border-burgundy-dark bg-burgundy-dark',
          )}
          data-testid="mobile-preview"
        >
          <Img
            src={preview.mobile.src}
            alt={preview.mobile.alt}
            width={preview.mobile.width}
            height={preview.mobile.height}
            className="aspect-[390/844] w-full object-cover object-top"
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button
          variant={dark ? 'onDarkOutline' : 'secondary'}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="min-h-11 px-5 py-2.5"
        >
          <Maximize2 className="size-4" aria-hidden />
          View full homepage
        </Button>
      </div>
      <p className={cn('mt-3 text-xs', dark ? 'text-on-dark-mute' : 'text-burgundy-dark/75')}>
        Screenshots of the live site, captured {dateLabel(preview.capturedOn)}. Desktop {preview.desktop.width} × {preview.desktop.height}, phone {preview.mobile.width} × {preview.mobile.height}.
      </p>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`${project.name} homepage`}
        description={`Full-page screenshots of the live site${host ? ` (${host})` : ''}, captured ${dateLabel(preview.capturedOn)}.`}
        size="lg"
      >
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Preview device" className="mb-4 inline-flex gap-1 rounded-full border border-line-strong p-1">
            {[
              { v: 'desktop', l: 'Desktop' },
              { v: 'mobile', l: 'Mobile' },
            ].map(({ v, l }) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="min-h-11 rounded-full px-5 text-sm font-medium text-ink-soft transition-colors data-[state=active]:bg-burgundy data-[state=active]:text-ivory"
              >
                {l}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="desktop" className="outline-none">
            <div
              role="region"
              aria-label={`${project.name} desktop homepage, scrollable`}
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable scroll region, so keyboard users can scroll it
              tabIndex={0}
              className="max-h-[60vh] overflow-auto rounded-[16px] border border-line bg-white"
            >
              <Img
                src={preview.fullDesktop.src}
                alt={preview.fullDesktop.alt}
                width={preview.fullDesktop.width}
                height={preview.fullDesktop.height}
                className="block h-auto w-full"
              />
            </div>
          </Tabs.Content>
          <Tabs.Content value="mobile" className="outline-none">
            <div
              role="region"
              aria-label={`${project.name} mobile homepage, scrollable`}
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable scroll region, so keyboard users can scroll it
              tabIndex={0}
              className="mx-auto max-h-[60vh] max-w-[390px] overflow-auto rounded-[24px] border-[6px] border-burgundy-dark bg-white"
            >
              <Img
                src={preview.fullMobile.src}
                alt={preview.fullMobile.alt}
                width={preview.fullMobile.width}
                height={preview.fullMobile.height}
                className="block h-auto w-full"
              />
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </Modal>
    </div>
  )
}
