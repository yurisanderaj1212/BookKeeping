'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react'

export default function SubscribeCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">CN</span>
          </div>
          <span className="text-lg font-bold text-white">Chill Numbers</span>
        </div>

        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
          <XCircle className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Pago cancelado</h1>
        <p className="text-slate-400 mb-8">
          No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/subscribe')}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
