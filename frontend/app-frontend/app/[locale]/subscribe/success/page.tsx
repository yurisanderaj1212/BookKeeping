'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { getSubscriptionStatus } from '@/lib/subscriptionService'

export default function SubscribeSuccessPage() {
  const router      = useRouter()
  const [count,     setCount]     = useState(5)
  const [confirmed, setConfirmed] = useState(false)
  const [checking,  setChecking]  = useState(true)
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptsRef = useRef(0)
  const MAX_ATTEMPTS = 12  // 12 × 2.5s = 30s máximo esperando el webhook

  // Polling: esperar a que el backend confirme status Active
  useEffect(() => {
    async function checkStatus() {
      try {
        const info = await getSubscriptionStatus()
        if (info.hasActiveAccess && info.status === 'Active') {
          // Webhook procesado — suscripción activa
          setConfirmed(true)
          setChecking(false)
          // Actualizar cookie para que el middleware no bloquee
          document.cookie = `sub-status=Active; path=/; SameSite=Lax`
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // silencioso — seguir intentando
      }
      attemptsRef.current += 1
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        // Timeout: asumir éxito de todas formas (Stripe ya cobró)
        setConfirmed(true)
        setChecking(false)
        document.cookie = `sub-status=Active; path=/; SameSite=Lax`
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }

    // Primera comprobación inmediata
    checkStatus()
    // Luego cada 2.5 segundos
    pollRef.current = setInterval(checkStatus, 2500)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Cuenta regresiva — solo arranca cuando la suscripción está confirmada
  useEffect(() => {
    if (!confirmed) return
    if (count <= 0) {
      router.replace('/dashboard')
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [confirmed, count, router])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
          {checking
            ? <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
            : <CheckCircle className="w-10 h-10 text-green-400" />
          }
        </div>

        <h1 className="text-3xl font-bold mb-3">¡Suscripción activada!</h1>
        <p className="text-slate-400 mb-8">
          {checking
            ? 'Confirmando tu pago con Stripe...'
            : 'Tu pago fue procesado correctamente. Ya tienes acceso completo a BookKeeping.'
          }
        </p>

        <button
          onClick={() => router.replace('/dashboard')}
          disabled={checking}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Ir al dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-slate-500 text-sm mt-4">
          {checking
            ? 'Verificando el estado de tu suscripción...'
            : `Redirigiendo automáticamente en ${count}s...`
          }
        </p>
      </div>
    </div>
  )
}
