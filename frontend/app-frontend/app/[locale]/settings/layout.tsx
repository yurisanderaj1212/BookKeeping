import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configuración',
  robots: { index: false, follow: false },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
