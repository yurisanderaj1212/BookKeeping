'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard,
  Receipt,
  Users,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  Check,
  Wallet
} from 'lucide-react'
import TourTooltipWithArrow from './TourTooltipWithArrow'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  page: string
  icon: React.ComponentType<{ className?: string }>
  action?: () => void
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Chill Numbers!',
    description: 'Te guiaremos paso a paso para que conozcas todas las funciones de tu nueva herramienta de contabilidad.',
    target: 'body',
    position: 'bottom',
    page: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'sidebar',
    title: 'Navegación Principal',
    description: 'Aquí encontrarás todas las secciones de la aplicación. Puedes colapsar el menú con el botón de la esquina.',
    target: '[data-tour="sidebar"]',
    position: 'right',
    page: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'dashboard-overview',
    title: 'Panel de Control',
    description: 'Tu resumen financiero en tiempo real. Aquí verás ingresos, gastos y ganancias netas del período seleccionado.',
    target: '[data-tour="stats-cards"]',
    position: 'bottom',
    page: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    description: 'Accede rápidamente a las funciones más utilizadas: agregar transacciones, generar reportes y más.',
    target: '[data-tour="quick-actions"]',
    position: 'bottom',
    page: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'notifications',
    title: 'Centro de Notificaciones',
    description: 'Mantente al día con alertas importantes, recordatorios y actualizaciones del sistema.',
    target: '[data-tour="notification-btn"]',
    position: 'bottom',
    page: '/dashboard',
    icon: Bell
  },
  {
    id: 'accounts-intro',
    title: 'Gestión de Cuentas',
    description: 'Primero, crea tus cuentas bancarias, efectivo o tarjetas. Esto te permitirá llevar un control preciso de tus balances.',
    target: '[data-tour="accounts-main"]',
    position: 'top',
    page: '/accounts',
    icon: Wallet
  },
  {
    id: 'accounts-summary',
    title: 'Resumen de Cuentas',
    description: 'Aquí verás el balance total, número de cuentas activas y un resumen general de tus finanzas.',
    target: '[data-tour="accounts-summary"]',
    position: 'bottom',
    page: '/accounts',
    icon: Wallet
  },
  {
    id: 'add-account',
    title: 'Crear Nueva Cuenta',
    description: 'Haz clic aquí para agregar una cuenta bancaria, efectivo, tarjeta de crédito o cualquier otro tipo de cuenta.',
    target: '[data-tour="add-account-btn"]',
    position: 'bottom',
    page: '/accounts',
    icon: Wallet
  },
  {
    id: 'account-list',
    title: 'Lista de Cuentas',
    description: 'Todas tus cuentas aparecerán aquí. Podrás ver el balance, tipo de cuenta y realizar acciones como editar o desactivar.',
    target: '[data-tour="account-list"]',
    position: 'top',
    page: '/accounts',
    icon: Wallet
  },
  {
    id: 'transactions',
    title: 'Gestión de Transacciones',
    description: 'Ahora que tienes cuentas, puedes registrar transacciones y asignarlas a cada cuenta para un control detallado.',
    target: '[data-tour="transactions-main"]',
    position: 'top',
    page: '/transactions',
    icon: Receipt
  },
  {
    id: 'transaction-filters',
    title: 'Filtros de Transacciones',
    description: 'Filtra por categoría, tipo, fecha o busca transacciones específicas usando estos controles.',
    target: '[data-tour="transaction-filters"]',
    position: 'bottom',
    page: '/transactions',
    icon: Receipt
  },
  {
    id: 'add-transaction',
    title: 'Nueva Transacción',
    description: 'Registra ingresos o gastos. Puedes asignar una cuenta (opcional) para actualizar automáticamente su balance.',
    target: '[data-tour="add-transaction-btn"]',
    position: 'bottom',
    page: '/transactions',
    icon: Receipt
  },
  {
    id: 'transaction-with-account',
    title: 'Transacciones con Cuentas',
    description: 'Al crear una transacción, puedes seleccionar una cuenta. El sistema te mostrará el balance disponible y te advertirá si excedes fondos.',
    target: '[data-tour="transaction-list"]',
    position: 'top',
    page: '/transactions',
    icon: Receipt
  },
  {
    id: 'employees',
    title: 'Gestión de Empleados',
    description: 'Administra la información de tu equipo y calcula automáticamente los costos de nómina.',
    target: '[data-tour="employees-main"]',
    position: 'top',
    page: '/employees',
    icon: Users
  },
  {
    id: 'add-employee',
    title: 'Agregar Empleado',
    description: 'Registra nuevos empleados con toda su información: datos personales, salario y tipo de pago.',
    target: '[data-tour="add-employee-btn"]',
    position: 'bottom',
    page: '/employees',
    icon: Users
  },
  {
    id: 'reports',
    title: 'Reportes Financieros',
    description: 'Genera reportes profesionales para análisis financiero, presentaciones y cumplimiento fiscal.',
    target: '[data-tour="reports-grid"]',
    position: 'top',
    page: '/reports',
    icon: FileText
  },
  {
    id: 'analytics',
    title: 'Análisis Avanzado',
    description: 'Visualiza tendencias, compara períodos y obtén insights profundos de tu negocio con gráficos interactivos.',
    target: '[data-tour="analytics-main"]',
    position: 'top',
    page: '/analytics',
    icon: BarChart3
  },
  {
    id: 'settings',
    title: 'Configuración',
    description: 'Personaliza tu perfil, información de empresa, notificaciones y preferencias del sistema.',
    target: '[data-tour="settings-link"]',
    position: 'right',
    page: '/settings',
    icon: Settings
  },
  {
    id: 'complete',
    title: '¡Tour Completado!',
    description: 'Ya conoces el flujo completo: crea cuentas, registra transacciones y genera reportes. ¡Comienza a gestionar tus finanzas!',
    target: 'body',
    position: 'bottom',
    page: '/dashboard',
    icon: Check
  }
]

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  currentStep?: number
  setStep?: (step: number) => void
}

// Storage key for tour progress
const TOUR_PROGRESS_KEY = 'chill-numbers-tour-progress'
const ONBOARDING_STORAGE_KEY = 'chill-numbers-onboarding-completed'

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Load saved progress on mount and ensure visibility
  useEffect(() => {
    if (isOpen) {
      const savedProgress = localStorage.getItem(TOUR_PROGRESS_KEY)
      if (savedProgress) {
        const progress = parseInt(savedProgress, 10)
        if (progress >= 0 && progress < tourSteps.length) {
          setCurrentStep(progress)
        }
      }
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // Save progress whenever step changes
  useEffect(() => {
    if (isVisible && isOpen) {
      localStorage.setItem(TOUR_PROGRESS_KEY, currentStep.toString())
    }
  }, [currentStep, isVisible, isOpen])

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up highlights and overlays when component unmounts
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
      document.querySelectorAll('.tour-overlay').forEach(el => {
        el.remove()
      })
    }
  }, [])

  useEffect(() => {
    if (isVisible && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep]
      
      // Navigate to page if different
      if (step.page !== window.location.pathname) {
        router.push(step.page)
        return // Don't highlight until navigation is complete
      }
      
      // Wait for page to load and then highlight element
      const timeoutId = setTimeout(() => {
        const targetElement = document.querySelector(step.target)
        
        if (targetElement && step.target !== 'body') {
          // Remove previous highlights immediately
          document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight')
          })
          
          // Remove previous overlays immediately
          document.querySelectorAll('.tour-overlay').forEach(el => {
            el.remove()
          })
          
          // Add highlight immediately
          targetElement.classList.add('tour-highlight')
          
          // Create overlay for better visibility
          const overlay = document.createElement('div')
          overlay.className = 'tour-overlay'
          document.body.appendChild(overlay)
          
          // Scroll to element after highlight is applied
          if (step.target === '[data-tour="sidebar"]') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            })
          }
        }
      }, 800) // Reduced from 2500ms to 800ms for faster response
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentStep, isVisible, router])

  // Force tour to stay visible when it should be open
  useEffect(() => {
    if (isOpen && !isVisible) {
      console.log('🔄 Forzando visibilidad del tour...')
      setIsVisible(true)
    }
  }, [isOpen, isVisible])

  // Keep tour visible during page reloads/re-renders
  useEffect(() => {
    if (isOpen) {
      const intervalId = setInterval(() => {
        if (!isVisible) {
          console.log('🔄 Tour se cerró inesperadamente, reabriendo...')
          setIsVisible(true)
        }
      }, 500)
      
      return () => clearInterval(intervalId)
    }
  }, [isOpen, isVisible])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      
      // Navigate to next step's page if different from current
      const nextStepData = tourSteps[nextStep]
      if (nextStepData.page !== window.location.pathname) {
        router.push(nextStepData.page)
      }
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      
      // Navigate to previous step's page if different from current
      const prevStepData = tourSteps[prevStep]
      if (prevStepData.page !== window.location.pathname) {
        router.push(prevStepData.page)
      }
    }
  }

  const handleComplete = () => {
    // Clean up any remaining highlights and overlays
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    document.querySelectorAll('.tour-overlay').forEach(el => {
      el.remove()
    })
    
    // Clear saved progress
    localStorage.removeItem(TOUR_PROGRESS_KEY)
    
    setIsVisible(false)
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    // Clean up any remaining highlights and overlays
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    document.querySelectorAll('.tour-overlay').forEach(el => {
      el.remove()
    })
    
    // Mark tour as completed when skipped
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    localStorage.removeItem(TOUR_PROGRESS_KEY)
    
    setIsVisible(false)
    onComplete() // This will mark it as completed in the hook
    onClose()
  }

  if (!isVisible || currentStep >= tourSteps.length) {
    return null
  }

  const step = tourSteps[currentStep]

  return (
    <TourTooltipWithArrow
      target={step.target}
      title={step.title}
      description={step.description}
      currentStep={currentStep}
      totalSteps={tourSteps.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      isVisible={isVisible}
    />
  )
}