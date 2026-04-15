'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSubscriptionStatus, createCheckoutSession } from '@/lib/subscriptionService'
import { getSupabase } from '@/lib/supabaseClient'

export default function CheckoutGatePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function gate() {
      try {
        // Wait for Supabase session to be fully established after OAuth
        let session = null
        for (let i = 0; i < 10; i++) {
          const supabase = getSupabase()
          const { data } = await supabase.auth.getSession()
          if (data.session) { session = data.session; break }
          await new Promise(r => setTimeout(r, 500))
        }

        if (!session) {
          // No session after 5s — go to login
          router.replace('/auth/login')
          return
        }

        const info = await getSubscriptionStatus()
        if (info.hasActiveAccess) {
          router.replace('/dashboard')
          return
        }

        // No active subscription — send to Stripe Checkout
        setStatus('redirecting')
        const { url } = await createCheckoutSession('monthly')
        window.location.href = url

      } catch (err: any) {
        const msg = err?.message ?? String(err)
        setErrorMsg(msg)
        setStatus('error')
        // After 3s show error then go to dashboard
        setTimeout(() => router.replace('/dashboard'), 3000)
      }
    }
    gate()
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
