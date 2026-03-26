'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/apiClient'
import { translateApiError, getErrorCode } from '@/lib/apiErrorMap'
import AppLogo from '@/components/ui/AppLogo'

type Step = 'request' | 'sent' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep]           = useState<Step>('request')
  const [email, setEmail]         = useState('')
  const [token, setToken]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  const t = useTranslations('auth.forgotPassword')
  const tErr = useTranslations('apiErrors')

  // ─── Paso 1: solicitar reset ──────────────────────────────────────────────
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(email)) {
      setError(t('email') + ' inválido.')
      return
    }

    setIsLoading(true)
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
        skipAuth: true,
      })
    } catch {
      // Always advance — don't reveal if email exists
    } finally {
      setIsLoading(false)
      setStep('sent')
    }
  }

  // ─── Paso 3: establecer nueva contraseña ──────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) { setError('Ingresa el código de verificación.'); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }

    const hasUpper  = /[A-Z]/.test(password)
    const hasLower  = /[a-z]/.test(password)
    const hasDigit  = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
      setError(tErr('passwordWeak'))
      return
    }
    if (password !== confirm) { setError(tErr('passwordMismatch')); return }

    setIsLoading(true)
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim(), token: token.trim(), newPassword: password }),
        skipAuth: true,
      })
      setStep('done')
    } catch (err: unknown) {
      const code = getErrorCode(err)
      setError(translateApiError(code, tErr))
    } finally {
      setIsLoading(false)
    }
  }

  const passwordReqs = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    lower:   /[a-z]/.test(password),
    digit:   /[0-9]/.test(password),
    symbol:  /[^A-Za-z0-9]/.test(password),
  }
  const passwordStrong = Object.values(passwordReqs).every(Boolean)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <AppLogo size={36} variant="full" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── PASO 1: Solicitar reset ── */}
          {step === 'request' && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tu email y te enviaremos un código para restablecerla.
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar código de verificación'}
                </button>
              </form>
            </>
          )}

          {/* ── PASO 2: Email enviado ── */}
          {step === 'sent' && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Revisa tu email</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Si <span className="font-medium text-gray-700">{email}</span> está registrado,
                  recibirás un código de verificación en los próximos minutos.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-700">
                El código expira en 15 minutos. Revisa también tu carpeta de spam.
              </div>

              <button
                onClick={() => setStep('reset')}
                className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors mb-3"
              >
                Tengo mi código
              </button>

              <button
                onClick={() => { setStep('request'); setError('') }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Usar otro email
              </button>
            </>
          )}

          {/* ── PASO 3: Ingresar código + nueva contraseña ── */}
          {step === 'reset' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">Nueva contraseña</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa el código que recibiste y tu nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => { setToken(e.target.value); setError('') }}
                    placeholder="Ej: 847291"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                        password && passwordStrong
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {[
                        { ok: passwordReqs.length, label: '8+ caracteres' },
                        { ok: passwordReqs.upper,  label: 'Mayúscula' },
                        { ok: passwordReqs.lower,  label: 'Minúscula' },
                        { ok: passwordReqs.digit,  label: 'Número' },
                        { ok: passwordReqs.symbol, label: 'Símbolo' },
                      ].map(r => (
                        <div key={r.label} className={`flex items-center gap-1 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    placeholder="Repite la contraseña"
                    required
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      confirm && confirm === password
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !passwordStrong || password !== confirm}
                  className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
              </form>
            </>
          )}

          {/* ── PASO 4: Éxito ── */}
          {step === 'done' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h1>
              <p className="text-sm text-gray-500 mb-6">
                Tu contraseña fue restablecida exitosamente. Ya puedes iniciar sesión.
              </p>
              <Link
                href="/auth/login"
                className="block w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors text-center"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          )}

        </div>

        {/* Back to login */}
        {step !== 'done' && (
          <div className="text-center mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
