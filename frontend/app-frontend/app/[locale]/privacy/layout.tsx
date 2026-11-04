import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Chill Numbers',
  description: 'Conoce cómo recopilamos, usamos y protegemos tu información personal en Chill Numbers. Tu privacidad es nuestra prioridad.',
  alternates: {
    canonical: 'https://chillnumbers.com/privacy',
    languages: {
      en: 'https://chillnumbers.com/privacy',
      es: 'https://chillnumbers.com/es/privacy',
    },
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
