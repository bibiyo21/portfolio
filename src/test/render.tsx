import { render } from '@testing-library/react'
import { MotionConfig } from 'framer-motion'
import type { ReactElement } from 'react'
import { ContactModal } from '../components/contact/ContactModal'
import { ContactModalProvider } from '../hooks/useContactModal'
import { SceneProvider } from '../hooks/useScene'

/** Render with scene state, contact modal context, reduced motion and the modal mounted, as in App. */
export function renderWithApp(ui: ReactElement) {
  return render(
    <MotionConfig reducedMotion="always">
      <ContactModalProvider>
        <SceneProvider>
          {ui}
          <ContactModal />
        </SceneProvider>
      </ContactModalProvider>
    </MotionConfig>,
  )
}
