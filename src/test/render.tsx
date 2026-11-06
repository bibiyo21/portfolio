import { render } from '@testing-library/react'
import { MotionConfig } from 'framer-motion'
import type { ReactElement } from 'react'
import { ContactModal } from '../components/ui/ContactModal'
import { ContactModalProvider } from '../hooks/useContactModal'

/** Render with the contact modal context, reduced motion and the modal mounted, as in App. */
export function renderWithApp(ui: ReactElement) {
  return render(
    <MotionConfig reducedMotion="always">
      <ContactModalProvider>
        {ui}
        <ContactModal />
      </ContactModalProvider>
    </MotionConfig>,
  )
}
