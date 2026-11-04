import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — Chill Numbers',
  description: 'Información sobre el uso de cookies en Chill Numbers. Qué cookies usamos, para qué y cómo gestionarlas.',
  alternates: {
    canonical: 'https://chillnumbers.com/cookies',
    languages: {
      en: 'https://chillnumbers.com/cookies',
      es: 'https://chillnumbers.com/es/cookies',
    },
  },
}

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
