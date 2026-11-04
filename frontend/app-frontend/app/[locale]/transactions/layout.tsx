import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transacciones',
  robots: { index: false, follow: false },
}

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
