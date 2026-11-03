'use client'

import { useEffect, useRef, useCallback } from 'react'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  /** 'normal' muestra el widget visible (fallback), 'invisible' corre en background */
  appearance?: 'always' | 'execute' | 'interaction-only'
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!

export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  appearance = 'interaction-only',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef  = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return

    // Evitar renderizar dos veces
    if (widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current)
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey:    SITE_KEY,
      appearance,
      theme:      'auto',
      callback:   (token: string) => onVerify(token),
      'expired-callback': () => {
        onExpire?.()
      },
      'error-callback': () => {
        onError?.()
      },
    })
  }, [appearance, onVerify, onExpire, onError])

  useEffect(() => {
    // Si el script ya cargó, renderizar directo
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Si el script ya está en el DOM pero no cargó aún, esperar al callback
    if (document.getElementById('cf-turnstile-script')) {
      window.onTurnstileLoad = renderWidget
      return
    }

    // Agregar el script de Cloudflare
    window.onTurnstileLoad = renderWidget
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      // Limpiar el widget al desmontar
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  return <div ref={containerRef} />
}
