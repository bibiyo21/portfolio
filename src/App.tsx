import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { ContactModal } from './components/contact/ContactModal'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { CaseStudyScene } from './components/projects/CaseStudyScene'
import { SceneControls } from './components/scenes/SceneControls'
import { About } from './components/sections/About'
import { Architecture } from './components/sections/Architecture'
import { CICDShowcase } from './components/sections/CICDShowcase'
import { Contact } from './components/sections/Contact'
import { Experience } from './components/sections/Experience'
import { Expertise } from './components/sections/Expertise'
import { Faq } from './components/sections/Faq'
import { Hero } from './components/sections/Hero'
import { Recognition } from './components/sections/Recognition'
import { Work } from './components/sections/Work'
import { ContactModalProvider } from './hooks/useContactModal'
import { SceneProvider } from './hooks/useScene'
import { profile, projects } from './lib/content-loader'
import { scenes } from './lib/scenes'

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
            <Faq />
            <Contact />
          </main>
          <Footer />
          <ContactModal />
        </SceneProvider>
      </ContactModalProvider>
    </MotionConfig>
  )
}
