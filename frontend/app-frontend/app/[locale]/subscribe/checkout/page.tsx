'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/lib/subscriptionService'
import { getSupabase } from '@/lib/supabaseClient'

/**
 * Checkout gate — called after OAuth login or email verification.
 * Waits for Supabase session via onAuthStateChange, then:
 * - If user has stripe_customer_id → dashboard
 * - If not → Stripe Checkout (monthly trial)
 */
export default function CheckoutGatePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const supabase = getSupabase()
    let handled = false

    async function handleSession(userId: string, accessToken: string) {
      if (handled) return
      handled = true

      try {
        // Check subscriptions table directly — no Edge Function needed for this check
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .single()

        if (sub?.stripe_customer_id) {
          // Already has Stripe subscription → dashboard
          router.replace('/dashboard')
          return
        }

        // No Stripe subscription → go to Checkout
        setStatus('redirecting')

        const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey':        supabaseAnon,
          },
          body: JSON.stringify({ action: 'createCheckoutSession', plan: 'monthly' }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
        window.location.href = data.url

      } catch (err: any) {
        setErrorMsg(err?.message ?? String(err))
        setStatus('error')
        setTimeout(() => router.replace('/dashboard'), 4000)
      }
    }

    // Listen for auth state — fires immediately if session already exists
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSession(session.user.id, session.access_token)
      }
    })

    // Also check immediately in case session is already in localStorage
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        handleSession(data.session.user.id, data.session.access_token)
      }
    })

    // Timeout fallback — if no session after 8s, go to login
    const timeout = setTimeout(() => {
      if (!handled) {
        router.replace('/auth/login')
      }
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        {status === 'error' ? (
          <>
            <p className="text-red-400 text-sm mb-2">Error: {errorMsg}</p>
            <p className="text-white/40 text-xs">Redirigiendo al dashboard...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-[#81ecff] animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">
              {status === 'checking' ? 'Verificando tu cuenta...' : 'Preparando tu suscripción...'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
