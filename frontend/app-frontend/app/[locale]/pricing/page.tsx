'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Zap, Shield, BarChart3, Users, FileText, Bell } from 'lucide-react'
import { createCheckoutSession } from '@/lib/subscriptionService'
import { isAuthenticated } from '@/lib/auth'

const FEATURES = [
  { icon: BarChart3, text: 'Dashboard con métricas en tiempo real' },
  { icon: FileText,  text: 'Transacciones ilimitadas' },
  { icon: Users,     text: 'Gestión de empleados' },
  { icon: Shield,    text: 'Reportes y cierres semanales' },
  { icon: Bell,      text: 'Notificaciones inteligentes' },
  { icon: Zap,       text: 'Soporte prioritario' },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function handleSelect(plan: 'monthly' | 'annual') {
    if (!isAuthenticated()) {
      router.push('/auth/register')
      return
    }
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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">B</div>
          <span className="font-semibold text-lg">BookKeeping</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/auth/login"  className="text-slate-400 hover:text-white transition-colors">Iniciar sesión</Link>
          <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors">
            Prueba gratis
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Planes y precios
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparente,<br />sin sorpresas
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Empieza gratis por 30 días. Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Trial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Prueba gratuita</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400 mb-1">/30 días</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">Sin tarjeta de crédito</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block text-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 font-semibold transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>

          {/* Monthly */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Plan mensual</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-slate-400 mb-1">/mes</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">Facturado mensualmente</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect('monthly')}
              disabled={loading !== null}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {loading === 'monthly' ? 'Redirigiendo...' : 'Suscribirse'}
            </button>
          </div>

          {/* Annual — highlighted */}
          <div className="bg-blue-600/20 border-2 border-blue-500 rounded-2xl p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Mejor valor
              </span>
            </div>
            <div className="mb-6">
              <p className="text-blue-300 text-sm font-medium mb-1">Plan anual</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">$99.99</span>
                <span className="text-blue-300 mb-1">/año</span>
              </div>
              <p className="text-blue-400 text-sm mt-2">Equivale a $8.33/mes · Ahorras $20</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-200">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect('annual')}
              disabled={loading !== null}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-colors"
            >
              {loading === 'annual' ? 'Redirigiendo...' : 'Suscribirse anualmente'}
            </button>
          </div>
        </div>

        {/* FAQ / trust */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-center text-sm text-slate-400">
          <div>
            <p className="text-white font-semibold mb-1">Sin contratos</p>
            <p>Cancela en cualquier momento desde tu panel de facturación.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Pagos seguros</p>
            <p>Procesados por Stripe. Nunca almacenamos datos de tu tarjeta.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Soporte incluido</p>
            <p>Respuesta en menos de 24 horas para todos los planes.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-slate-500 text-xs">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/terms"   className="hover:text-slate-300 transition-colors">Términos</Link>
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacidad</Link>
          <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
        </div>
        © {new Date().getFullYear()} BookKeeping. Todos los derechos reservados.
      </footer>
    </div>
  )
}
