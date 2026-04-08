'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSupabase } from '@/lib/supabaseClient'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

const PROTECTED = ['/dashboard','/transactions','/reports','/analytics','/settings','/week-close','/notifications','/accounts','/subscribe']
const AUTH_ROUTES = ['/auth/login','/auth/register','/auth/forgot-password']

const isProtected = (p: string) => PROTECTED.some(r => p.includes(r))
const isAuthRoute = (p: string) => AUTH_ROUTES.some(r => p.includes(r))

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = getSupabase()

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        setUser({
          id: u.id, email: u.email!,
          firstName: u.user_metadata?.first_name ?? '',
          lastName: u.user_metadata?.last_name ?? '',
        })
        // Ensure Cash account exists for this user
        import('@/services/accountService').then(({ accountService }) => {
          accountService.ensureCashAccount().catch(console.error)
        })
      } else {
        setUser(null)
        if (isProtected(pathname)) router.replace('/auth/login')
      }
      setIsLoading(false)
    })

    // Escuchar cambios de sesión en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        setUser({
          id: u.id, email: u.email!,
          firstName: u.user_metadata?.first_name ?? '',
          lastName: u.user_metadata?.last_name ?? '',
        })
        // Reset session start on new login
        if (_event === 'SIGNED_IN') {
          localStorage.setItem('cn_session_start', String(Date.now()))
        }
        if (isAuthRoute(pathname)) router.replace('/dashboard')
      } else {
        setUser(null)
        if (isProtected(pathname)) router.replace('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  const logout = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    localStorage.removeItem('cn_session_start')
    setUser(null)
    router.replace('/auth/login')
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  }
}
