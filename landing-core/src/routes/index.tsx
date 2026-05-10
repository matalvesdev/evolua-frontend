import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Hero } from '../components/Hero'
import { Marquee } from '../components/Marquee'
import { Manifesto } from '../components/Manifesto'
import { PainPoints } from '../components/PainPoints'
import { Services } from '../components/Services'
import { HowItWorks } from '../components/HowItWorks'

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
      <Suspense fallback={null}>
        <Pricing />
        <Testimonial />
        <BottomCTA />
      </Suspense>
    </>
  )
}
