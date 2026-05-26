import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { Hero } from '../components/Hero'
import { Marquee } from '../components/Marquee'
import { Manifesto } from '../components/Manifesto'
import { PainPoints } from '../components/PainPoints'
import { Services } from '../components/Services'
import { HowItWorks } from '../components/HowItWorks'
import { LeadMagnetsGrid } from '../components/LeadMagnetCard'

// Lazy-load below-fold components
const Pricing = lazy(() => import('../components/Pricing').then((m) => ({ default: m.Pricing })))
const Testimonial = lazy(() => import('../components/Testimonial').then((m) => ({ default: m.Testimonial })))
const BottomCTA = lazy(() => import('../components/BottomCTA').then((m) => ({ default: m.BottomCTA })))

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Manifesto />
      <PainPoints />
      <Services />
      <HowItWorks />

      {/* Lead Magnets */}
      <section className="py-20 md:py-28 px-5 md:px-12 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 50, damping: 18 }}
            className="mb-12"
          >
            <h2 className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.9] text-ink mb-4">
              Materiais gratuitos<span className="text-primary">.</span>
            </h2>
            <p className="text-base text-ink-soft/80 max-w-lg">
              Ferramentas prontas para usar no seu dia a dia. Baixe grátis.
            </p>
          </motion.div>
          <LeadMagnetsGrid />
          <div className="mt-10 text-center">
            <a
              href="/materiais"
              className="inline-block text-sm font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Ver todos os materiais →
            </a>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Pricing />
        <Testimonial />
        <BottomCTA />
      </Suspense>
    </>
  )
}
