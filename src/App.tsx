import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { ContactModal } from './components/ui/ContactModal'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Affiliations } from './components/sections/Affiliations'
import { CICDShowcase } from './components/sections/CICDShowcase'
import { Experience } from './components/sections/Experience'
import { Skills } from './components/sections/Skills'
import { Hero } from './components/sections/Hero'
import { Philosophy } from './components/sections/Philosophy'
import { Projects } from './components/sections/Projects'
import { ContactModalProvider } from './hooks/useContactModal'
import { profile } from './lib/content-loader'

export default function App() {
  useEffect(() => {
    document.title = profile.seo.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', profile.seo.description)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <ContactModalProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Affiliations />
          <Projects />
          <Skills />
          <Philosophy />
          <CICDShowcase />
          <Contact />
        </main>
        <Footer />
        <ContactModal />
      </ContactModalProvider>
    </MotionConfig>
  )
}
