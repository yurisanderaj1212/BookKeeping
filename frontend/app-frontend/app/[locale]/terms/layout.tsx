import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Chill Numbers',
  description: 'Términos y condiciones de uso del servicio Chill Numbers. Conoce tus derechos y responsabilidades al usar nuestra plataforma.',
  alternates: {
    canonical: 'https://chillnumbers.com/terms',
    languages: {
      en: 'https://chillnumbers.com/terms',
      es: 'https://chillnumbers.com/es/terms',
    },
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
