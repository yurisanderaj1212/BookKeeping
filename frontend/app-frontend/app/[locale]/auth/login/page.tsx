'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import AppLogo from '@/components/ui/AppLogo'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import AuthFlipCard from '@/components/auth/AuthFlipCard'

// Inline wrapper needed because LanguageSwitcher uses Suspense internally
function LanguageSwitcherInline() {
  return <LanguageSwitcher variant="compact" />
}

// Componente interno que usa useSearchParams — debe estar dentro de <Suspense>
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError } = useNotifications()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const t = useTranslations('auth.login')
  const tc = useTranslations('common')
  const tErr = useTranslations('apiErrors')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lockedMessage, setLockedMessage] = useState('')

  const justRegistered = searchParams.get('registered') === '1'
  const justVerified   = searchParams.get('verified') === '1'

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  // Esperar a que el cliente monte antes de renderizar
  // Evita flash de contenido y redirecciones prematuras
  if (authLoading) {
    return null
  }

  // Si ya está autenticado (y montado), no mostrar el form — ya se redirigió
  if (isAuthenticated) {
    return null
  }

  // Función para limpiar errores cuando el usuario empieza a corregir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Limpiar error de email cuando el usuario empieza a escribir
    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Limpiar error de password cuando el usuario empieza a escribir
    if (errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setLockedMessage('')
    
    // Validaciones del frontend que coinciden con el backend (LoginRequest)
    const newErrors: Record<string, string> = {}
    
    if (!email.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = t('errors.emailInvalid')
      }
    }
    
    if (!password) {
      newErrors.password = t('errors.passwordRequired')
    } else if (password.length < 8) {
      newErrors.password = t('errors.passwordMin')
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }
    
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const redirect = searchParams.get('redirect')
      router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard')

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setErrors({ email: t('errors.invalidCredentials'), password: t('errors.invalidCredentials') })
      } else {
        showError(tc('error'), msg || tc('error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    if (provider !== 'google') {
      showError(tc('error'), t('socialNotAvailable', { provider }))
      return
    }
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) showError(tc('error'), error.message)
    } catch {
      showError(tc('error'), tc('connectionError'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo + language switcher row */}
          <div className="flex items-center justify-between mb-4">
            <AppLogo size={32} variant="full" />
            <LanguageSwitcherInline />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-navy-800 dark:text-gray-100">{t('title')}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">{t('subtitle')}</p>
          </div>

          <div className="mt-4">
            {/* Banner: registro exitoso */}
            {justRegistered && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-tight">{ t('registeredSuccess') }</span>
              </div>
            )}
            {justVerified && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-tight">{ t('verifiedSuccess') }</span>
              </div>
            )}

            {/* Banner: cuenta bloqueada */}
            {lockedMessage && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>{lockedMessage}</span>
              </div>
            )}

            {/* Email Form */}
            <form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
              {/* Campos falsos para confundir al navegador */}
              <input type="text" style={{display: 'none'}} />
              <input type="password" style={{display: 'none'}} />
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  {t('email')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="username"
                    type="email"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.email ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="user-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.password ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder={t('passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                {/* Campo "Recordarme" comentado temporalmente - no es necesario para el backend actual */}
                {/*
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Recordarme
                  </label>
                </div>
                */}
                <div></div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('submitting')}
                    </>
                  ) : (
                    t('submit')
                  )}
                </button>
              </div>
            </form>

            {/* Social Login Buttons */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 dark:bg-gray-950 text-slate-500 dark:text-gray-400">{t('orContinueWith')}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex justify-center items-center px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-center">
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  {t('noAccount')}{' '}
                  <Link href="/auth/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                    {t('register')}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Dark with FlipCard */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-[#0c0e12] flex flex-col justify-center items-center p-12 gap-10">
          {/* Ambient glows */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#81ecff]/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#bf81ff]/6 rounded-full blur-[100px] pointer-events-none" />

          {/* Flip card */}
          <div className="relative z-10 w-full max-w-sm">
            <AuthFlipCard />
          </div>

          {/* Text below */}
          <div className="relative z-10 text-center max-w-sm">
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t('panelTitle')}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">{t('panelSubtitle')}</p>
          </div>

          {/* Security badges */}
          <div className="relative z-10 flex items-center gap-6 text-white/30">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs uppercase tracking-widest">{t('panelSsl')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs uppercase tracking-widest">{t('panelUptime')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Suspense es obligatorio en Next.js App Router cuando se usa useSearchParams
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
