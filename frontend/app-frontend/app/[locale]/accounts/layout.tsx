import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cuentas',
  robots: { index: false, follow: false },
}

export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
