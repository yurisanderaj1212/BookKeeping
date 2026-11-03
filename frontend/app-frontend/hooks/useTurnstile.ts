'use client'

import { useState, useCallback } from 'react'

interface UseTurnstileReturn {
  token: string | null
  isVerified: boolean
  isVerifying: boolean
  error: string | null
  handleVerify: (token: string) => Promise<void>
  handleExpire: () => void
  handleError: () => void
  reset: () => void
}

export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken]           = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setVerifying] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const handleVerify = useCallback(async (cfToken: string) => {
    setVerifying(true)
    setError(null)
    try {
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cfToken }),
      })
      const data = await res.json() as { success: boolean; error?: string }

      if (data.success) {
        setToken(cfToken)
        setIsVerified(true)
      } else {
        setError(data.error ?? 'Verificación fallida')
        setIsVerified(false)
        setToken(null)
      }
    } catch {
      setError('Error de red al verificar. Intenta de nuevo.')
      setIsVerified(false)
      setToken(null)
    } finally {
      setVerifying(false)
    }
  }, [])

  const handleExpire = useCallback(() => {
    setToken(null)
    setIsVerified(false)
  }, [])

  const handleError = useCallback(() => {
    setError('Error en la verificación de seguridad. Recarga la página.')
    setIsVerified(false)
    setToken(null)
  }, [])

  const reset = useCallback(() => {
    setToken(null)
    setIsVerified(false)
    setError(null)
    setVerifying(false)
  }, [])

  return { token, isVerified, isVerifying, error, handleVerify, handleExpire, handleError, reset }
}
