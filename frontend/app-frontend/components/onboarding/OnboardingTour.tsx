'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, Receipt, Users, FileText, BarChart3,
  Settings, Bell, Wallet, Check, ChevronRight, ChevronLeft, X, Sparkles
} from 'lucide-react'

// Step IDs — the text comes from i18n, only metadata stays here
const STEP_META = [
  { id: 'welcome',      target: '',                                page: '/dashboard',    icon: Sparkles,        iconColor: 'text-yellow-500' },
  { id: 'sidebar',      target: '[data-tour="sidebar"]',           page: '/dashboard',    icon: LayoutDashboard, iconColor: 'text-blue-500'   },
  { id: 'dashboard',    target: '[data-tour="stats-cards"]',       page: '/dashboard',    icon: LayoutDashboard, iconColor: 'text-blue-500'   },
  { id: 'notifs',       target: '[data-tour="notification-btn"]',  page: '/dashboard',    icon: Bell,            iconColor: 'text-purple-500' },
  { id: 'accounts',     target: '[data-tour="accounts-main"]',     page: '/accounts',     icon: Wallet,          iconColor: 'text-green-500'  },
  { id: 'add-account',  target: '[data-tour="add-account-btn"]',   page: '/accounts',     icon: Wallet,          iconColor: 'text-green-500'  },
  { id: 'transactions', target: '[data-tour="transactions-main"]', page: '/transactions', icon: Receipt,         iconColor: 'text-orange-500' },
  { id: 'add-tx',       target: '[data-tour="add-transaction-btn"]',page: '/transactions',icon: Receipt,         iconColor: 'text-orange-500' },
  { id: 'employees',    target: '[data-tour="employees-main"]',    page: '/employees',    icon: Users,           iconColor: 'text-indigo-500' },
  { id: 'reports',      target: '[data-tour="reports-grid"]',      page: '/reports',      icon: FileText,        iconColor: 'text-red-500'    },
  { id: 'analytics',    target: '[data-tour="analytics-main"]',    page: '/analytics',    icon: BarChart3,       iconColor: 'text-teal-500'   },
  { id: 'settings',     target: '[data-tour="settings-main"]',     page: '/settings',     icon: Settings,        iconColor: 'text-gray-500'   },
  { id: 'complete',     target: '',                                page: '/dashboard',    icon: Check,           iconColor: 'text-green-500'  },
] as const

// Map step id → translation key (matches the keys in tour.steps.*)
const STEP_KEY: Record<string, string> = {
  'welcome':      'welcome',
  'sidebar':      'sidebar',
  'dashboard':    'dashboard',
  'notifs':       'notifications',
  'accounts':     'accounts',
  'add-account':  'addAccount',
  'transactions': 'transactions',
  'add-tx':       'addTransaction',
  'employees':    'employees',
  'reports':      'reports',
  'analytics':    'analytics',
  'settings':     'settings',
  'complete':     'complete',
}

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
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [selector, active])
  return rect
}

export default function OnboardingTour({
  isOpen, onClose, onComplete, currentStep = 0, setStep,
}: OnboardingTourProps) {
  const router = useRouter()
  const t = useTranslations('tour')
  const tSteps = useTranslations('tour.steps')

  const [step, setLocalStep] = useState(currentStep)
  const [fading, setFading] = useState(false)

  const meta = STEP_META[step]
  const isLast = step === STEP_META.length - 1
  const isFirst = step === 0
  const progress = ((step + 1) / STEP_META.length) * 100

  useEffect(() => { setLocalStep(currentStep) }, [currentStep])

  useEffect(() => {
    if (!isOpen || !meta) return
    const target = `/es${meta.page}`
    if (!window.location.pathname.includes(meta.page)) router.push(target)
  }, [step, isOpen, meta, router])

  const spot = useSpotlight(meta?.target ?? '', isOpen && !!(meta?.target))

  const goTo = useCallback((next: number) => {
    setFading(true)
    localStorage.setItem('cn-onboarding-step', String(next))
    setTimeout(() => { setLocalStep(next); setStep?.(next); setFading(false) }, 160)
  }, [setStep])

  useEffect(() => {
    if (!isOpen) return
    const saved = localStorage.getItem('cn-onboarding-step')
    if (saved !== null) {
      const n = parseInt(saved)
      if (!isNaN(n) && n > 0 && n < STEP_META.length) {
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

  const handleSkip = useCallback(() => {
    localStorage.removeItem('cn-onboarding-step')
    onComplete()
    onClose()
  }, [onComplete, onClose])

  if (!isOpen || !meta) return null

  const Icon = meta.icon
  const PAD = 10
  const stepKey = STEP_KEY[meta.id] ?? 'welcome'

  const overlayPanels = spot ? [
    { top: 0,                              left: 0, right: 0,                                    height: Math.max(0, spot.top - PAD) },
    { top: spot.top + spot.height + PAD,   left: 0, right: 0,                                    bottom: 0 },
    { top: spot.top - PAD,                 left: 0, width: Math.max(0, spot.left - PAD),          height: spot.height + PAD * 2 },
    { top: spot.top - PAD,                 left: spot.left + spot.width + PAD, right: 0,          height: spot.height + PAD * 2 },
  ] : null

  return (
    <>
      {/* Overlay */}
      {spot && overlayPanels ? (
        <>
          {overlayPanels.map((s, i) => (
            <div key={i} className="fixed z-9998 pointer-events-none"
              style={{ ...s, background: 'rgba(0,0,0,0.55)' }} />
          ))}
          <div className="fixed z-9998 pointer-events-none rounded-xl" style={{
            top: spot.top - PAD, left: spot.left - PAD,
            width: spot.width + PAD * 2, height: spot.height + PAD * 2,
            outline: '2px solid rgba(99,102,241,0.85)',
            transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
          }} />
        </>
      ) : (
        <div className="fixed inset-0 z-9998 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.45)' }} />
      )}

      {/* Tour panel */}
      <div className="fixed bottom-6 right-6 z-9999 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-linear-to-r from-indigo-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ${meta.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 tabular-nums">
              {step + 1} / {STEP_META.length}
            </span>
          </div>
          <button onClick={handleSkip}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-50"
            aria-label={t('ariaClose')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3" style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(6px)' : 'translateY(0)',
          transition: 'opacity 0.16s ease, transform 0.16s ease',
        }}>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 leading-snug">
            {tSteps(`${stepKey}.title` as any)}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {tSteps(`${stepKey}.description` as any)}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1 py-2">
          {STEP_META.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={t('ariaStep', { n: String(i + 1) })}>
              <div className="rounded-full transition-all duration-200" style={{
                width: i === step ? 16 : 6, height: 6,
                background: i === step ? '#6366f1' : i < step ? '#a5b4fc' : '#e5e7eb',
              }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1 gap-2">
          <button onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
            {t('btnSkip')}
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={handlePrev} disabled={fading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />{t('btnPrev')}
              </button>
            )}
            <button onClick={handleNext} disabled={fading}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 shadow-sm">
              {isLast
                ? (<><Check className="w-3.5 h-3.5" />{t('btnFinish')}</>)
                : (<>{t('btnNext')}<ChevronRight className="w-3.5 h-3.5" /></>)
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
