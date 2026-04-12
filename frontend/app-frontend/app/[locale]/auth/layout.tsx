import type { Metadata } from 'next'
import AuthPageTransition from '@/components/auth/AuthPageTransition'

export const metadata: Metadata = {
  title: 'Chill Numbers',
  description: 'Inicia sesión o crea tu cuenta de Chill Numbers.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthPageTransition>{children}</AuthPageTransition>
}
