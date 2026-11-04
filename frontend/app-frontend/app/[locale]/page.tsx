import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Benefits from '@/components/Benefits'
import About from '@/components/About'
import Pricing from '@/components/Pricing'
import CTA from '@/components/CTA'

export const metadata: Metadata = {
  title: 'Chill Numbers — Software de Contabilidad para Pequeñas Empresas',
  description: 'Gestiona tus finanzas con confianza. Control de ingresos, gastos, empleados y reportes financieros. Prueba gratis 30 días, sin tarjeta de crédito.',
  keywords: [
    'software de contabilidad',
    'contabilidad para pequeñas empresas',
    'gestión financiera',
    'control de ingresos y gastos',
    'bookkeeping app',
    'reportes financieros',
    'nómina empleados',
    'chill numbers',
  ],
  openGraph: {
    title: 'Chill Numbers — Software de Contabilidad para Pequeñas Empresas',
    description: 'Gestiona tus finanzas con confianza. Control de ingresos, gastos, empleados y reportes. Prueba gratis 30 días.',
    url: 'https://chillnumbers.com',
    siteName: 'Chill Numbers',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chill Numbers — Contabilidad para Pequeñas Empresas',
    description: 'Gestiona tus finanzas con confianza. Prueba gratis 30 días.',
  },
  alternates: {
    canonical: 'https://chillnumbers.com',
    languages: {
      'en': 'https://chillnumbers.com',
      'es': 'https://chillnumbers.com/es',
    },
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Hero />
      <Features />
      <Benefits />
      <About />
      <Pricing />
      <CTA />
    </main>
  )
}