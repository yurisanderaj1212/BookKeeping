'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, AlertCircle, Zap } from 'lucide-react'
import { createCheckoutSession, getSubscriptionStatus } from '@/lib/subscriptionService'

function SubscribeContent() {
  const searchParams = useSearchParams()
  const canceled     = searchParams?.get('canceled') === '1'

  const [loading, setLoading]   = useState<'monthly' | 'annual' | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    getSubscriptionStatus()
      .then(s => setDaysLeft(s.trialDaysRemaining))
      .catch(() => {})
  }, [])

  async function handleSelect(plan: 'monthly' | 'annual') {
    setError(null)
    setLoading(plan)
    try {
      const { url } = await createCheckoutSession(plan)
      window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar el pago.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          {daysLeft === 0 ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Tu período de prueba ha terminado</h1>
              <p className="text-slate-400">Elige un plan para seguir usando BookKeeping sin interrupciones.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Elige tu plan</h1>
              <p className="text-slate-400">
                {daysLeft !== null
                  ? `Te quedan ${daysLeft} día${daysLeft !== 1 ? 's' : ''} de prueba.`
                  : 'Continúa con acceso completo a todas las funciones.'}
              </p>
            </>
          )}
        </div>

        {canceled && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Cancelaste el proceso de pago. Puedes intentarlo de nuevo cuando quieras.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Monthly */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col">
            <p className="text-slate-400 text-sm font-medium mb-1">Plan mensual</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-slate-400 mb-1">/mes</span>
            </div>
            <p className="text-slate-500 text-xs mb-6">Facturado mensualmente</p>
            <ul className="space-y-2 mb-8 flex-1 text-sm text-slate-300">
              {['Acceso completo', 'Transacciones ilimitadas', 'Soporte incluido', 'Cancela cuando quieras'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect('monthly')}
              disabled={loading !== null}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {loading === 'monthly' ? 'Redirigiendo...' : 'Elegir mensual'}
            </button>
          </div>

          {/* Annual */}
          <div className="bg-blue-600/20 border-2 border-blue-500 rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">MEJOR VALOR</span>
            </div>
            <p className="text-blue-300 text-sm font-medium mb-1">Plan anual</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold">$99.99</span>
              <span className="text-blue-300 mb-1">/año</span>
            </div>
            <p className="text-blue-400 text-xs mb-6">$8.33/mes · Ahorras $20</p>
            <ul className="space-y-2 mb-8 flex-1 text-sm text-slate-200">
              {['Acceso completo', 'Transacciones ilimitadas', 'Soporte prioritario', 'Cancela cuando quieras'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect('annual')}
              disabled={loading !== null}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {loading === 'annual' ? 'Redirigiendo...' : 'Elegir anual'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Pagos procesados de forma segura por Stripe. No almacenamos datos de tu tarjeta.
        </p>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  )
}
