import { Accordion } from '../ui/Accordion'
import { faq, profile } from '../../lib/content-loader'
import { renderAnswer } from './faq-answer'

/** Content-driven FAQ list. Single-open by default; pass `multiple` to allow several open rows. */
export function FaqAccordion({ multiple = false }: { multiple?: boolean }) {
  return (
    <Accordion
      multiple={multiple}
      headingLevel={3}
      items={faq.items.map((q) => ({
        id: q.id,
        title: q.question,
        content: <p className="t-body-l">{renderAnswer(q.answer, profile)}</p>,
      }))}
    />
  )
}
