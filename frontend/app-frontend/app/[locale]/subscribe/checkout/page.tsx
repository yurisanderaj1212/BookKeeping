'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSubscriptionStatus, createCheckoutSession } from '@/lib/subscriptionService'

/**
 * Checkout gate — called after OAuth login.
 * - If user already has an active/trialing subscription → go to dashboard
 * - If user has no subscription → redirect to Stripe Checkout (monthly trial)
 */
export default function CheckoutGatePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'redirecting'>('checking')

  useEffect(() => {
    async function gate() {
      try {
        const info = await getSubscriptionStatus()
        if (info.hasActiveAccess) {
          // Already subscribed or in trial — go straight to dashboard
          router.replace('/dashboard')
          return
        }
        // No active subscription — send to Stripe Checkout
        setStatus('redirecting')
        const { url } = await createCheckoutSession('monthly')
        window.location.href = url
      } catch {
        // Fallback — if anything fails, go to dashboard
        router.replace('/dashboard')
      }
    }
    gate()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-[#81ecff] animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">
          {status === 'checking' ? 'Verificando tu cuenta...' : 'Preparando tu suscripción...'}
        </p>
      </div>
    </div>
  )
}
