import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Benefits from '@/components/Benefits'
import Pricing from '@/components/Pricing'
import CTA from '@/components/CTA'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Hero />
      <Features />
      <Benefits />
      <Pricing />
      <CTA />
    </main>
  )
}