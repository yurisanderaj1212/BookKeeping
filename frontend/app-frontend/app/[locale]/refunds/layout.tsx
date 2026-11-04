import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Reembolsos — Chill Numbers',
  description: '7 días de garantía en plan mensual, 14 días en plan anual. Conoce las condiciones de reembolso y cancelación de Chill Numbers.',
  alternates: {
    canonical: 'https://chillnumbers.com/refunds',
    languages: {
      en: 'https://chillnumbers.com/refunds',
      es: 'https://chillnumbers.com/es/refunds',
    },
  },
}

export default function RefundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
