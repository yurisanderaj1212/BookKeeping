import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios — Chill Numbers',
  description: 'Planes simples y transparentes. Prueba gratis 30 días sin tarjeta de crédito. Plan mensual $9.99/mes o anual $99.99/año con acceso completo.',
  keywords: [
    'precios software contabilidad',
    'plan mensual contabilidad',
    'software contabilidad barato',
    'chill numbers precios',
    'prueba gratis contabilidad',
  ],
  openGraph: {
    title: 'Precios — Chill Numbers',
    description: 'Planes simples y transparentes. Prueba gratis 30 días sin tarjeta de crédito.',
    url: 'https://chillnumbers.com/pricing',
  },
  alternates: {
    canonical: 'https://chillnumbers.com/pricing',
    languages: {
      en: 'https://chillnumbers.com/pricing',
      es: 'https://chillnumbers.com/es/pricing',
    },
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
