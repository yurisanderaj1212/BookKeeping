'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const CONSENT_KEY = 'cn_cookie_consent'

type ConsentState = 'accepted' | 'declined' | null

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>('accepted') // inicia oculto
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentState | null
    setConsent(saved) // null = no ha decidido → muestra el banner
  }, [])

  // No renderizar hasta que el componente esté montado en cliente
  // (evita flash de hidratación)
  if (!mounted) return null

  // Si ya tomó una decisión, no mostrar nada
  if (consent !== null) return null

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setConsent('accepted')
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setConsent('declined')
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Icono + texto */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Usamos cookies
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Usamos cookies esenciales para mantener tu sesión y cookies de seguridad de
                Cloudflare para proteger el sitio contra bots. No usamos cookies de publicidad
                ni seguimiento.{' '}
                <Link
                  href="/cookies"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Más información
                </Link>
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2 shrink-0 sm:ml-4">
            <button
              onClick={decline}
              className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              aria-label="Solo cookies esenciales"
            >
              Solo esenciales
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Aceptar todas las cookies"
            >
              Aceptar
            </button>
            <button
              onClick={decline}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden"
              aria-label="Cerrar aviso de cookies"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
