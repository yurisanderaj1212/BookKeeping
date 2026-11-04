import type { Metadata } from 'next'
import AuthPageTransition from '@/components/auth/AuthPageTransition'

export const metadata: Metadata = {
  title: 'Acceso — Chill Numbers',
  description: 'Inicia sesión o crea tu cuenta de Chill Numbers. Gestiona tus finanzas desde cualquier lugar.',
  robots: {
    index: false,  // Las páginas de auth no deben aparecer en Google
    follow: false,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthPageTransition>{children}</AuthPageTransition>
}
