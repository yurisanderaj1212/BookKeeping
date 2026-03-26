'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSubscriptionStatus, type SubscriptionInfo } from '@/lib/subscriptionService'
import { isAuthenticated } from '@/lib/auth'

/**
 * Sincroniza el estado de suscripción con la cookie sub-status
 * para que el middleware pueda redirigir a /subscribe si expiró.
 */
function syncSubCookie(status: string) {
  if (typeof document === 'undefined') return
  // Cookie de sesión (sin max-age → expira al cerrar el navegador)
  document.cookie = `sub-status=${status}; path=/; SameSite=Lax`
}

export function useSubscription() {
  const router = useRouter()
  const [info, setInfo]       = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!isAuthenticated()) { setLoading(false); return }
    try {
      const data = await getSubscriptionStatus()
      setInfo(data)
      syncSubCookie(data.status)

      // Si expiró y no estamos ya en /subscribe, redirigir
      if (!data.hasActiveAccess) {
        const path = window.location.pathname
        const exempt = ['/subscribe', '/pricing', '/settings/billing', '/auth']
        if (!exempt.some(r => path.startsWith(r))) {
          router.replace('/subscribe')
        }
      }
    } catch {
      // Si falla la llamada, no bloqueamos al usuario
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  return { info, loading, refresh: load }
}
