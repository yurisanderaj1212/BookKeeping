'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Receipt, Users, FileText, BarChart3,
  Settings, Bell, Wallet, Check, ChevronRight, ChevronLeft, X, Sparkles
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  page: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

const STEPS: TourStep[] = [
  { id: 'welcome',      title: '¡Bienvenido a Chill Numbers!',  description: 'Te guiaremos por todas las funciones de tu herramienta de contabilidad. El tour toma menos de 2 minutos.',                                                    target: '',                           page: '/dashboard',    icon: Sparkles,         iconColor: 'text-yellow-500' },
  { id: 'sidebar',      title: 'Navegación Principal',           description: 'Desde aquí accedes a todas las secciones. Puedes colapsar el menú con el botón de la esquina para ganar espacio.',                                               target: '[data-tour="sidebar"]',      page: '/dashboard',    icon: LayoutDashboard,  iconColor: 'text-blue-500'   },
  { id: 'dashboard',    title: 'Panel de Control',               description: 'Tu resumen financiero en tiempo real: ingresos, gastos y ganancias netas. Todo de un vistazo.',                                                                   target: '[data-tour="stats-cards"]',  page: '/dashboard',    icon: LayoutDashboard,  iconColor: 'text-blue-500'   },
  { id: 'notifs',       title: 'Notificaciones',                 description: 'Alertas importantes, recordatorios y actualizaciones del sistema aparecen aquí.',                                                                                  target: '[data-tour="notification-btn"]', page: '/dashboard', icon: Bell,             iconColor: 'text-purple-500' },
  { id: 'accounts',     title: 'Gestión de Cuentas',             description: 'Crea tus cuentas bancarias, efectivo o tarjetas. Cada transacción puede vincularse a una cuenta para actualizar su balance automáticamente.',                     target: '[data-tour="accounts-main"]',page: '/accounts',     icon: Wallet,           iconColor: 'text-green-500'  },
  { id: 'add-account',  title: 'Crear Nueva Cuenta',             description: 'Agrega cuentas bancarias, efectivo, tarjetas de crédito o cualquier otro tipo de cuenta.',                                                                        target: '[data-tour="add-account-btn"]', page: '/accounts',  icon: Wallet,           iconColor: 'text-green-500'  },
  { id: 'transactions', title: 'Transacciones',                  description: 'Registra ingresos y gastos. Filtra por categoría, tipo, fecha o cuenta para encontrar cualquier movimiento.',                                                     target: '[data-tour="transactions-main"]', page: '/transactions', icon: Receipt,       iconColor: 'text-orange-500' },
  { id: 'add-tx',       title: 'Nueva Transacción',              description: 'Registra un ingreso o gasto en segundos. Selecciona la categoría y la cuenta asociada.',                                                                          target: '[data-tour="add-transaction-btn"]', page: '/transactions', icon: Receipt,    iconColor: 'text-orange-500' },
  { id: 'employees',    title: 'Gestión de Empleados',           description: 'Administra tu equipo: datos personales, tipo de nómina y calcula el costo total anual de tu plantilla.',                                                          target: '[data-tour="employees-main"]', page: '/employees',  icon: Users,            iconColor: 'text-indigo-500' },
  { id: 'reports',      title: 'Reportes Financieros',           description: 'Genera reportes profesionales: P&L, resumen de transacciones, desglose por categoría. Exporta a Excel o PDF.',                                                    target: '[data-tour="reports-grid"]', page: '/reports',      icon: FileText,         iconColor: 'text-red-500'    },
  { id: 'analytics',    title: 'Análisis Avanzado',              description: 'Visualiza tendencias, compara períodos anuales y obtén insights con gráficos interactivos.',                                                                      target: '[data-tour="analytics-main"]', page: '/analytics',  icon: BarChart3,        iconColor: 'text-teal-500'   },
  { id: 'settings',     title: 'Configuración',                  description: 'Personaliza tu perfil, información de empresa, preferencias de notificaciones y seguridad.',                                                                      target: '[data-tour="settings-main"]', page: '/settings',    icon: Settings,         iconColor: 'text-gray-500'   },
  { id: 'complete',     title: '¡Listo para empezar!',           description: 'Ya conoces todo el flujo: crea cuentas, registra transacciones y genera reportes. Tu negocio bajo control.',                                                      target: '',                           page: '/dashboard',    icon: Check,            iconColor: 'text-green-500'  },
]

export interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  currentStep?: number
  setStep?: (s: number) => void
}

interface SpotRect { top: number; left: number; width: number; height: number }

function useSpotlight(selector: string, active: boolean): SpotRect | null {
  const [rect, setRect] = useState<SpotRect | null>(null)
  useEffect(() => {
    if (!active || !selector) { setRect(null); return }
    const measure = () => {
      const el = document.querySelector(selector)
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    const t = setTimeout(measure, 200)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true) }
  }, [selector, active])
  return rect
}

export default function OnboardingTour({ isOpen, onClose, onComplete, currentStep = 0, setStep }: OnboardingTourProps) {
  const router = useRouter()
  const [step, setLocalStep] = useState(currentStep)
  const [fading, setFading] = useState(false)

  const data = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0
  const progress = ((step + 1) / STEPS.length) * 100

  useEffect(() => { setLocalStep(currentStep) }, [currentStep])

  useEffect(() => {
    if (!isOpen || !data) return
    const target = `/es${data.page}`
    if (!window.location.pathname.includes(data.page)) router.push(target)
  }, [step, isOpen, data, router])

  const spot = useSpotlight(data?.target ?? '', isOpen && !!(data?.target))

  const goTo = useCallback((next: number) => {
    setFading(true)
    // Guardar progreso en localStorage para sobrevivir navegaciones
    localStorage.setItem('cn-onboarding-step', String(next))
    setTimeout(() => { setLocalStep(next); setStep?.(next); setFading(false) }, 160)
  }, [setStep])

  // Al montar, restaurar paso guardado
  useEffect(() => {
    if (!isOpen) return
    const saved = localStorage.getItem('cn-onboarding-step')
    if (saved !== null) {
      const n = parseInt(saved)
      if (!isNaN(n) && n > 0 && n < STEPS.length) {
        setLocalStep(n)
        setStep?.(n)
      }
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    if (isLast) { localStorage.removeItem('cn-onboarding-step'); onComplete() }
    else goTo(step + 1)
  }, [isLast, step, goTo, onComplete])
  const handlePrev = useCallback(() => { if (!isFirst) goTo(step - 1) }, [isFirst, step, goTo])
  const handleSkip = useCallback(() => { localStorage.removeItem('cn-onboarding-step'); onComplete(); onClose() }, [onComplete, onClose])

  if (!isOpen || !data) return null

  const Icon = data.icon
  const PAD = 10

  // 4-panel overlay — works correctly even for edge elements like the sidebar
  const overlayPanels = spot ? [
    { top: 0,                        left: 0,              right: 0,             height: Math.max(0, spot.top - PAD) },
    { top: spot.top + spot.height + PAD, left: 0,          right: 0,             bottom: 0 },
    { top: spot.top - PAD,           left: 0,              width: Math.max(0, spot.left - PAD), height: spot.height + PAD * 2 },
    { top: spot.top - PAD,           left: spot.left + spot.width + PAD, right: 0, height: spot.height + PAD * 2 },
  ] : null

  return (
    <>
      {/* Overlay */}
      {spot && overlayPanels ? (
        <>
          {overlayPanels.map((s, i) => (
            <div key={i} className="fixed z-[9998] pointer-events-none" style={{ ...s, background: 'rgba(0,0,0,0.55)' }} />
          ))}
          {/* Spotlight border */}
          <div className="fixed z-[9998] pointer-events-none rounded-xl" style={{
            top: spot.top - PAD, left: spot.left - PAD,
            width: spot.width + PAD * 2, height: spot.height + PAD * 2,
            outline: '2px solid rgba(99,102,241,0.85)',
            outlineOffset: '0px',
            transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
          }} />
        </>
      ) : (
        <div className="fixed inset-0 z-[9998] pointer-events-none" style={{ background: 'rgba(0,0,0,0.45)' }} />
      )}

      {/* Tour panel */}
      <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 ${data.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 tabular-nums">{step + 1} / {STEPS.length}</span>
          </div>
          <button onClick={handleSkip} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-50" aria-label="Cerrar tour">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3" style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.16s ease, transform 0.16s ease' }}>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 leading-snug">{data.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{data.description}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1 py-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Paso ${i + 1}`}>
              <div className="rounded-full transition-all duration-200" style={{
                width: i === step ? 16 : 6, height: 6,
                background: i === step ? '#6366f1' : i < step ? '#a5b4fc' : '#e5e7eb'
              }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1 gap-2">
          <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
            Saltar tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={handlePrev} disabled={fading} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />Anterior
              </button>
            )}
            <button onClick={handleNext} disabled={fading} className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 shadow-sm">
              {isLast ? (<><Check className="w-3.5 h-3.5" />Finalizar</>) : (<>Siguiente<ChevronRight className="w-3.5 h-3.5" /></>)}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
