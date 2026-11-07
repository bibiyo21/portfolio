import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { CaseStudyScene } from './components/projects/CaseStudyScene'
import { SceneControls } from './components/scenes/SceneControls'
import { About } from './components/sections/About'
import { Affiliations } from './components/sections/Affiliations'
import { Architecture } from './components/sections/Architecture'
import { CICDShowcase } from './components/sections/CICDShowcase'
import { Contact } from './components/sections/Contact'
import { Experience } from './components/sections/Experience'
import { Expertise } from './components/sections/Expertise'
import { Faq } from './components/sections/Faq'
import { Hero } from './components/sections/Hero'
import { Recognition } from './components/sections/Recognition'
import { Work } from './components/sections/Work'
import { ContactModalProvider, useContactModal } from './hooks/useContactModal'
import { SceneProvider } from './hooks/useScene'
import { profile, projects } from './lib/content-loader'
import { scenes } from './lib/scenes'

// The inquiry form (with its validation and reCAPTCHA code) loads on first open, and is fetched in the
// background shortly after the page settles so opening it rarely waits.
const loadContactModal = () => import('./components/contact/ContactModal')
const ContactModal = lazy(() => loadContactModal().then((m) => ({ default: m.ContactModal })))

function LazyContactModal() {
  const { open } = useContactModal()
  // Once opened, the form stays mounted so its exit animation and state survive closing.
  const [mounted, setMounted] = useState(false)
  if (open && !mounted) setMounted(true)
  useEffect(() => {
    const warm = () => void loadContactModal()
    const t = window.setTimeout(warm, 2500)
    window.addEventListener('pointerdown', warm, { once: true, capture: true })
    window.addEventListener('keydown', warm, { once: true, capture: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('pointerdown', warm, { capture: true })
      window.removeEventListener('keydown', warm, { capture: true })
    }
  }, [])
  return mounted ? (
    <Suspense fallback={null}>
      <ContactModal />
    </Suspense>
  ) : null
}

export default function App() {
  useEffect(() => {
    document.title = profile.seo.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', profile.seo.description)
  }, [])

  const caseStudies = projects.items.filter((p) => p.scene)
  const sceneNumber = (id: string) => String(scenes.findIndex((s) => s.id === id)).padStart(2, '0')

  return (
    <MotionConfig reducedMotion="user">
      <ContactModalProvider>
        <SceneProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <SceneControls />
          <main id="main">
            <Hero />
            <About />
            <Expertise />
            <Work />
            {caseStudies.map((p) => (
              <CaseStudyScene
                key={p.id}
                project={p}
                tone={scenes.find((s) => s.id === p.scene)?.tone ?? 'ivory'}
                number={sceneNumber(p.scene!)}
              />
            ))}
            <Experience />
            <Architecture />
            <CICDShowcase />
            <Recognition />
            <Affiliations />
            <Faq />
            <Contact />
          </main>
          <Footer />
          <LazyContactModal />
        </SceneProvider>
      </ContactModalProvider>
    </MotionConfig>
  )
}
