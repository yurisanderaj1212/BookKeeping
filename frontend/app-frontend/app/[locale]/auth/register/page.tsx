'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import AppLogo from '@/components/ui/AppLogo'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import AuthFlipCard from '@/components/auth/AuthFlipCard'
import { ArrowLeft } from 'lucide-react'

// Lista de empleos comunes en Estados Unidos
const US_JOBS = [
  'Contador', 'Asistente Administrativo', 'Arquitecto', 'Abogado', 'Barbero/Estilista',
  'Dueño de Negocio', 'Carpintero', 'Chef/Cocinero', 'Consultor', 'Contratista', 'Dentista', 'Diseñador',
  'Desarrollador/Programador', 'Doctor/Médico', 'Electricista', 'Ingeniero', 'Emprendedor',
  'Asesor Financiero', 'Freelancer', 'Diseñador Gráfico', 'Agente de Seguros', 'Gerente',
  'Especialista en Marketing', 'Mecánico', 'Enfermero', 'Fotógrafo', 'Plomero', 'Agente Inmobiliario',
  'Gerente de Retail', 'Representante de Ventas', 'Maestro/Educador', 'Terapeuta', 'Veterinario',
  'Escritor/Autor', 'Otro'
]

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth.register')
  const tErr = useTranslations('apiErrors')
  const { showError } = useNotifications()
  const { isAuthenticated } = useAuth()

  // TODOS LOS HOOKS DEBEN ESTAR ANTES DE CUALQUIER RETURN CONDICIONAL
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  // Si ya está autenticado, no mostrar nada
  if (isAuthenticated) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpiar errores cuando el usuario empieza a corregir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Password strength calculation
    if (name === 'password') {
      calculatePasswordStrength(value)
      
      // Limpiar error de confirmPassword si las contraseñas ahora coinciden
      if (formData.confirmPassword && value === formData.confirmPassword && errors.confirmPassword) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.confirmPassword
          return newErrors
        })
      }
    }
    
    // Limpiar error de confirmPassword cuando coinciden
    if (name === 'confirmPassword') {
      if (value === formData.password && errors.confirmPassword) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.confirmPassword
          return newErrors
        })
      }
    }
  }

  const calculatePasswordStrength = (password: string) => {
    // Implementar la misma lógica que el backend: IsPasswordStrong
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasDigit = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    const hasMinLength = password.length >= 8
    
    let strength = 0
    if (hasMinLength) strength += 20
    if (hasUpper) strength += 20
    if (hasLower) strength += 20
    if (hasDigit) strength += 20
    if (hasSymbol) strength += 20
    
    setPasswordStrength(strength)
    
    // Verificar si cumple con todos los requisitos del backend
    const isStrong = hasMinLength && hasUpper && hasLower && hasDigit && hasSymbol
    
    // Si la contraseña ahora es fuerte, limpiar el error automáticamente
    if (isStrong && errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
    
    return isStrong
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500'
    if (passwordStrength < 80) return 'bg-yellow-500'
    if (passwordStrength === 100) return 'bg-green-500'
    return 'bg-orange-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength < 40) return t('strengthVeryWeak')
    if (passwordStrength < 80) return t('strengthWeak')
    if (passwordStrength === 100) return t('strengthStrong')
    return t('strengthGood')
  }

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    
    // Validaciones del frontend que coinciden con el backend
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('errors.firstNameRequired')
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('errors.lastNameRequired')
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else {
      // Validación de formato de email (misma regex que el backend)
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('errors.emailInvalid')
      } else if (formData.email.length > 100) {
        newErrors.email = t('errors.emailTooLong')
      }
    }
    
    if (!formData.password) {
      newErrors.password = t('errors.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = t('errors.passwordMin')
    } else {
      // Validación de contraseña fuerte (misma lógica que el backend)
      const hasUpper = /[A-Z]/.test(formData.password)
      const hasLower = /[a-z]/.test(formData.password)
      const hasDigit = /[0-9]/.test(formData.password)
      const hasSymbol = /[^A-Za-z0-9]/.test(formData.password)
      
      if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
        newErrors.password = t('errors.passwordWeak')
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordsMismatch')
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('errors.agreeToTermsRequired')
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      // No mostrar toast para errores de validación - los usuarios ya ven los errores específicos en cada campo
      return
    }
    
    // Preparar datos para enviar al backend (solo los campos que necesita)
    const registrationData = {
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName
    }

    try {
      const { signUp } = await import('@/services/authService')
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName)
      // Supabase sends verification email → user clicks link → /auth/callback
      // → /subscribe/checkout → Stripe Checkout → Dashboard
      router.push('/auth/login?registered=1')

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message.toLowerCase() : ''
      if (msg.includes('already') || msg.includes('registrado') || msg.includes('email')) {
        setErrors({ email: t('errors.emailInUse') })
      } else {
        showError(tErr('registerFailed'), error instanceof Error ? error.message : t('errors.registerFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = async (provider: string) => {
    if (provider !== 'google') {
      showError(tErr('unknown'), t('socialNotAvailable', { provider }))
      return
    }
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) showError(tErr('unknown'), error.message)
    } catch {
      showError(tErr('unknown'), tErr('connectionError'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      {/* Left Column - Dark with FlipCard */}
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
              {t('brandingTitle')}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">{t('brandingSubtitle')}</p>
          </div>

          {/* Trial badge */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full border border-[#81ecff]/20 bg-[#81ecff]/5">
            <svg className="w-3.5 h-3.5 text-[#81ecff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[#81ecff] text-xs font-bold uppercase tracking-widest">{t('trialBadge')}</span>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-2 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo + language switcher */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <AppLogo size={28} variant="full" />
            </div>
            <LanguageSwitcher variant="compact" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy-800 dark:text-gray-100">{t('title')}</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          <div className="mt-2">
            {/* Registration Form */}
            <form className="space-y-2" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-slate-700 dark:text-gray-300">
                    {t('firstName')}
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.firstName ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-slate-700 dark:text-gray-300">
                    {t('lastName')}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.lastName ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder="Pérez"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-gray-300">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.email ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                  }`}
                  placeholder="juan@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Campos comentados temporalmente - no son necesarios para el backend actual */}
              {/*
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700">
                    Empresa <span className="text-slate-400">(opcional)</span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Tu empresa"
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-slate-700">
                    Ocupación <span className="text-slate-400">(opcional)</span>
                  </label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Seleccionar ocupación</option>
                    {US_JOBS.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.occupation === 'Otro' && (
                <div>
                  <label htmlFor="customOccupation" className="block text-sm font-medium text-slate-700">
                    Por favor especifica tu ocupación
                  </label>
                  <input
                    id="customOccupation"
                    name="customOccupation"
                    type="text"
                    value={formData.customOccupation}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Ingresa tu ocupación"
                  />
                </div>
              )}
              */}

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.password 
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                        : formData.password && passwordStrength === 100
                        ? 'border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
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
                {formData.password && (
                  <div className="mt-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-gray-400">{getPasswordStrengthText()}</span>
                    </div>
                    
                    {/* Requisitos de contraseña */}
                    <div className="text-xs space-y-0.5">
                      {(() => {
                        const requirements = getPasswordRequirements(formData.password)
                        return (
                          <div className="grid grid-cols-2 gap-1">
                            <div className={`flex items-center space-x-1 ${requirements.minLength ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('req8chars')}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasUpper ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('reqUpper')}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasLower ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('reqLower')}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasDigit ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('reqNumber')}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasSymbol ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('reqSymbol')}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700 dark:text-gray-300">
                  {t('confirmPassword')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder={t('confirmPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                {(errors.confirmPassword || (formData.confirmPassword && formData.password !== formData.confirmPassword)) && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword || t('errors.passwordsMismatch')}
                  </p>
                )}
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-4">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                  />
                </div>
                <div className="ml-2 text-xs">
                  <label htmlFor="agreeToTerms" className="text-slate-700 dark:text-gray-300">
                    {t('agreeToTerms')}{' '}
                    <Link href="/terms" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                      {t('terms')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                      {t('privacy')}
                    </Link>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!formData.agreeToTerms || formData.password !== formData.confirmPassword || isLoading}
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

            {/* Social Registration Buttons - Moved to bottom */}
            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-50 dark:bg-gray-950 text-slate-500 dark:text-gray-400">{t('orRegisterWith')}</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSocialRegister('google')}
                  className="w-full flex justify-center items-center px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-xs font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-center">
                <span className="text-xs text-slate-600 dark:text-gray-400">
                  {t('hasAccount')}{' '}
                  <Link href="/auth/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                    {t('login')}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}