import { Scene } from '../scenes/Scene'
import { SceneBackdrop } from '../scenes/SceneBackdrop'
import { FaqAccordion } from '../faq/FaqAccordion'
import { Button } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { useScene } from '../../hooks/useScene'
import { faq } from '../../lib/content-loader'

export function Faq() {
  const { goTo } = useScene()
  return (
    <Scene id="faq" tone="ivory" backdrop={<SceneBackdrop tone="ivory" />}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <SectionHeading index="10" eyebrow={faq.eyebrow} id="faq-title" title={faq.title} intro={faq.intro} />
            <Reveal>
              <div className="rounded-[20px] bg-peach-soft p-6">
                <h3 className="t-heading-s">{faq.closing.title}</h3>
                <p className="mt-2 text-ink-soft">{faq.closing.text}</p>
                <div className="mt-5">
                  <Button arrow onClick={() => goTo('contact')}>
                    {faq.closing.label}
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Reveal>
            <FaqAccordion />
          </Reveal>
        </div>
      </div>
    </Scene>
  )
}
