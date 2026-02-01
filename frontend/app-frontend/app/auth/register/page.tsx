'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

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
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar nada (ya se redirigió)
  if (isAuthenticated) {
    return null
  }
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    // company: '',
    // occupation: '',
    // customOccupation: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (passwordStrength < 40) return 'Muy Débil'
    if (passwordStrength < 80) return 'Débil'
    if (passwordStrength === 100) return 'Fuerte'
    return 'Buena'
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
      newErrors.firstName = 'El nombre es requerido'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else {
      // Validación de formato de email (misma regex que el backend)
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El email no tiene un formato válido'
      } else if (formData.email.length > 100) {
        newErrors.email = 'El email no puede tener más de 100 caracteres'
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else {
      // Validación de contraseña fuerte (misma lógica que el backend)
      const hasUpper = /[A-Z]/.test(formData.password)
      const hasLower = /[a-z]/.test(formData.password)
      const hasDigit = /[0-9]/.test(formData.password)
      const hasSymbol = /[^A-Za-z0-9]/.test(formData.password)
      
      if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
        newErrors.password = 'La contraseña es demasiado débil. Debe incluir mayúsculas, minúsculas, números y símbolos.'
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Debes aceptar los términos y condiciones'
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
    
    console.log('Registration attempt:', registrationData)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        const result = await response.text()
        console.log('Registration successful:', result)
        
        // Redirección directa sin toast - experiencia más fluida
        router.push('/auth/login')
        
      } else {
        let errorMessage = 'Error en el registro'
        
        try {
          const errorData = await response.json()
          
          // Manejar errores de validación del backend
          if (errorData.errors) {
            const backendErrors: Record<string, string> = {}
            Object.keys(errorData.errors).forEach(key => {
              const fieldName = key.toLowerCase()
              backendErrors[fieldName] = errorData.errors[key][0]
            })
            setErrors(backendErrors)
            // No mostrar toast - los errores ya están visibles en los campos
            return
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch {
          // Si no es JSON, intentar obtener como texto
          try {
            const textError = await response.text()
            
            // Manejar errores específicos del backend
            if (textError.includes('email ya está registrado')) {
              setErrors({ email: 'Este email ya está registrado. Intenta con otro email o inicia sesión.' })
              return
            } else if (textError.includes('contraseñas no coinciden')) {
              setErrors({ confirmPassword: 'Las contraseñas no coinciden' })
              return
            } else if (textError.includes('contraseña es demasiado débil')) {
              setErrors({ password: 'La contraseña es demasiado débil. Debe incluir mayúsculas, minúsculas, números y símbolos.' })
              return
            } else if (textError.includes('email no tiene un formato válido')) {
              setErrors({ email: 'El email no tiene un formato válido' })
              return
            }
            
            errorMessage = textError
          } catch {
            errorMessage = `Error ${response.status}: ${response.statusText}`
          }
        }
        
        // Solo mostrar toast para errores no relacionados con validación de campos
        showError(errorMessage)
      }
    } catch (error) {
      console.error('Network error:', error)
      showError('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = (provider: string) => {
    // TODO: Implement social registration
    console.log(`Register with ${provider}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Column - Branding (Inverted) */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex flex-col justify-center items-center p-12">
          <div className="max-w-md text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium mb-4">
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30 días de prueba gratis - Sin tarjeta requerida
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-3">Comienza tu viaje hacia el éxito financiero</h3>
              <p className="text-primary-100 text-base leading-relaxed mb-6">
                Únete a más de 10,000 negocios que ya confían en Chill Numbers para gestionar sus finanzas de manera simple y efectiva.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Configuración en 5 minutos</h4>
                  <p className="text-primary-100 text-xs">Empieza a usar la plataforma inmediatamente</p>
                </div>
              </div>

              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.99-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Seguridad de nivel bancario</h4>
                  <p className="text-primary-100 text-xs">Tus datos están protegidos con encriptación de 256 bits</p>
                </div>
              </div>

              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Soporte 24/7</h4>
                  <p className="text-primary-100 text-xs">Nuestro equipo está siempre disponible para ayudarte</p>
                </div>
              </div>

              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Cancela cuando quieras</h4>
                  <p className="text-primary-100 text-xs">Sin compromisos ni penalizaciones</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">10K+</div>
                <div className="text-primary-200 text-xs">Usuarios activos</div>
              </div>
              <div>
                <div className="text-xl font-bold">99.9%</div>
                <div className="text-primary-200 text-xs">Uptime</div>
              </div>
              <div>
                <div className="text-xl font-bold">4.9</div>
                <div className="text-primary-200 text-xs">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-2 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <span className="text-xl font-bold text-navy-800">Chill Numbers</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy-800">Crea tu cuenta</h2>
            <p className="mt-1 text-xs text-slate-600">
              Comienza tu prueba gratuita de 30 días
            </p>
          </div>

          <div className="mt-2">
            {/* Registration Form */}
            <form className="space-y-2" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-slate-700">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${
                      errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-slate-700">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${
                      errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Pérez"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-700">
                  Dirección de email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="juan@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
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
                <label htmlFor="password" className="block text-xs font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg placeholder-slate-400 focus:outline-none text-sm ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : formData.password && passwordStrength === 100
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                    placeholder="Mínimo 8 caracteres"
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
                      <div className="flex-1 bg-slate-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{getPasswordStrengthText()}</span>
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
                              <span>8+ caracteres</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasUpper ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Mayúscula</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasLower ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Minúscula</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasDigit ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Número</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${requirements.hasSymbol ? 'text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Símbolo</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Confirma tu contraseña"
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
                    {errors.confirmPassword || 'Las contraseñas no coinciden'}
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
                  <label htmlFor="agreeToTerms" className="text-slate-700">
                    Acepto los{' '}
                    <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                      Términos de Servicio
                    </Link>{' '}
                    y la{' '}
                    <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                      Política de Privacidad
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
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
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
                  <span className="px-2 bg-slate-50 text-slate-500">O regístrate con</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSocialRegister('google')}
                  className="w-full flex justify-center items-center px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  onClick={() => handleSocialRegister('apple')}
                  className="w-full flex justify-center items-center px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-center">
                <span className="text-xs text-slate-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Iniciar sesión
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}