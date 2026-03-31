'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  LayoutDashboard, Receipt, Users, FileText, BarChart3,
  Settings, Bell, Wallet, Check, ChevronRight, ChevronLeft,
  X, Sparkles, Zap, TrendingUp, PieChart, Lock
} from 'lucide-react'

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEP_META = [
  { id: 'welcome',      target: '',                                   page: '/dashboard',    icon: Sparkles,       iconColor: '#f59e0b', bg: '#fffbeb' },
  { id: 'sidebar',      target: '[data-tour="sidebar"]',              page: '/dashboard',    icon: LayoutDashboard,iconColor: '#6366f1', bg: '#eef2ff' },
  { id: 'dashboard',    target: '[data-tour="stats-cards"]',          page: '/dashboard',    icon: TrendingUp,     iconColor: '#10b981', bg: '#ecfdf5' },
  { id: 'quickActions', target: '[data-tour="quick-actions"]',        page: '/dashboard',    icon: Zap,            iconColor: '#f59e0b', bg: '#fffbeb' },
  { id: 'notifs',       target: '[data-tour="notification-btn"]',     page: '/dashboard',    icon: Bell,           iconColor: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'accounts',     target: '[data-tour="accounts-main"]',        page: '/accounts',     icon: Wallet,         iconColor: '#10b981', bg: '#ecfdf5' },
  { id: 'add-account',  target: '[data-tour="accounts-summary"]',     page: '/accounts',     icon: Wallet,         iconColor: '#10b981', bg: '#ecfdf5' },
  { id: 'transactions', target: '[data-tour="transactions-main"]',    page: '/transactions', icon: Receipt,        iconColor: '#f97316', bg: '#fff7ed' },
  { id: 'add-tx',       target: '[data-tour="add-transaction-btn"]',  page: '/transactions', icon: Receipt,        iconColor: '#f97316', bg: '#fff7ed' },
  { id: 'tx-filters',   target: '[data-tour="transaction-filters"]',  page: '/transactions', icon: Receipt,        iconColor: '#f97316', bg: '#fff7ed' },
  { id: 'employees',    target: '[data-tour="employees-main"]',       page: '/employees',    icon: Users,          iconColor: '#6366f1', bg: '#eef2ff' },
  { id: 'reports',      target: '[data-tour="reports-grid"]',         page: '/reports',      icon: FileText,       iconColor: '#ef4444', bg: '#fef2f2' },
  { id: 'analytics',    target: '[data-tour="analytics-main"]',       page: '/analytics',    icon: PieChart,       iconColor: '#0ea5e9', bg: '#f0f9ff' },
  { id: 'settings',     target: '[data-tour="settings-main"]',        page: '/settings',     icon: Settings,       iconColor: '#6b7280', bg: '#f9fafb' },
  { id: 'complete',     target: '',                                   page: '/dashboard',    icon: Check,          iconColor: '#10b981', bg: '#ecfdf5' },
] as const

type StepId = typeof STEP_META[number]['id']

const STEP_KEY: Record<StepId, string> = {
  'welcome':      'welcome',
  'sidebar':      'sidebar',
  'dashboard':    'dashboard',
  'quickActions': 'quickActions',
  'notifs':       'notifications',
  'accounts':     'accounts',
  'add-account':  'addAccount',
  'transactions': 'transactions',
  'add-tx':       'addTransaction',
  'tx-filters':   'txFilters',
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

// ─── Smart positioning ────────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number }
type Side = 'top' | 'bottom' | 'left' | 'right' | 'center'

// Responsive tooltip width
const getTooltipW = () => typeof window !== 'undefined' ? Math.min(300, window.innerWidth - 24) : 300
const TOOLTIP_H = 260
const PAD = 10
const MARGIN = 12

function computePosition(rect: Rect): { side: Side; x: number; y: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const TOOLTIP_W = getTooltipW()

  const spaceBottom = vh - rect.top - rect.height
  const spaceTop    = rect.top
  const spaceRight  = vw - rect.left - rect.width
  const spaceLeft   = rect.left

  const cx = rect.left + rect.width / 2
  const cy = rect.top  + rect.height / 2

  // Prefer bottom, then right, then top, then left
  const candidates: { side: Side; score: number; x: number; y: number }[] = [
    {
      side: 'bottom', score: spaceBottom,
      x: Math.max(MARGIN, Math.min(vw - TOOLTIP_W - MARGIN, cx - TOOLTIP_W / 2)),
      y: rect.top + rect.height + PAD,
    },
    {
      side: 'right', score: spaceRight,
      x: rect.left + rect.width + PAD,
      y: Math.max(MARGIN, Math.min(vh - TOOLTIP_H - MARGIN, cy - TOOLTIP_H / 2)),
    },
    {
      side: 'top', score: spaceTop,
      x: Math.max(MARGIN, Math.min(vw - TOOLTIP_W - MARGIN, cx - TOOLTIP_W / 2)),
      y: rect.top - TOOLTIP_H - PAD,
    },
    {
      side: 'left', score: spaceLeft,
      x: rect.left - TOOLTIP_W - PAD,
      y: Math.max(MARGIN, Math.min(vh - TOOLTIP_H - MARGIN, cy - TOOLTIP_H / 2)),
    },
  ]

  // Filter candidates that fit
  const fits = candidates.filter(c => {
    if (c.side === 'bottom') return spaceBottom >= TOOLTIP_H + PAD
    if (c.side === 'top')    return spaceTop    >= TOOLTIP_H + PAD
    if (c.side === 'right')  return spaceRight  >= TOOLTIP_W + PAD
    if (c.side === 'left')   return spaceLeft   >= TOOLTIP_W + PAD
    return false
  })

  const best = fits.length > 0
    ? fits.sort((a, b) => b.score - a.score)[0]
    : candidates.sort((a, b) => b.score - a.score)[0]

  // Clamp to viewport
  best.x = Math.max(MARGIN, Math.min(vw - TOOLTIP_W - MARGIN, best.x))
  best.y = Math.max(MARGIN, Math.min(vh - TOOLTIP_H - MARGIN, best.y))

  return best
}

// ─── Spotlight hook ───────────────────────────────────────────────────────────

function useSpotlight(selector: string, active: boolean) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [pos, setPos]   = useState<{ side: Side; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!active || !selector) { setRect(null); setPos(null); return }

    const measure = () => {
      const el = document.querySelector(selector)
      if (!el) { setRect(null); setPos(null); return }
      const r = el.getBoundingClientRect()
      const newRect = { top: r.top, left: r.left, width: r.width, height: r.height }
      setRect(newRect)
      setPos(computePosition(newRect))
    }
    const t = setTimeout(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true) }
  }, [selector, active])

  return { rect, pos }
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

function Arrow({ side, rect, tooltipX, tooltipY, tooltipW }: { side: Side; rect: Rect; tooltipX: number; tooltipY: number; tooltipW: number }) {
  const S = 10
  const cx = rect.left + rect.width / 2
  const cy = rect.top  + rect.height / 2

  const style: React.CSSProperties = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }

  if (side === 'bottom') {
    const arrowLeft = Math.max(S + 4, Math.min(tooltipW - S * 2 - 4, cx - tooltipX))
    return <div style={{ ...style, top: -S, left: arrowLeft,
      borderLeft: `${S}px solid transparent`, borderRight: `${S}px solid transparent`,
      borderBottom: `${S}px solid white`, filter: 'drop-shadow(0 -1px 2px rgba(0,0,0,0.08))' }} />
  }
  if (side === 'top') {
    const arrowLeft = Math.max(S + 4, Math.min(tooltipW - S * 2 - 4, cx - tooltipX))
    return <div style={{ ...style, bottom: -S, left: arrowLeft,
      borderLeft: `${S}px solid transparent`, borderRight: `${S}px solid transparent`,
      borderTop: `${S}px solid white`, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }} />
  }
  if (side === 'right') {
    const arrowTop = Math.max(S + 4, Math.min(TOOLTIP_H - S * 2 - 4, cy - tooltipY))
    return <div style={{ ...style, left: -S, top: arrowTop,
      borderTop: `${S}px solid transparent`, borderBottom: `${S}px solid transparent`,
      borderRight: `${S}px solid white`, filter: 'drop-shadow(-1px 0 2px rgba(0,0,0,0.08))' }} />
  }
  if (side === 'left') {
    const arrowTop = Math.max(S + 4, Math.min(TOOLTIP_H - S * 2 - 4, cy - tooltipY))
    return <div style={{ ...style, right: -S, top: arrowTop,
      borderTop: `${S}px solid transparent`, borderBottom: `${S}px solid transparent`,
      borderLeft: `${S}px solid white`, filter: 'drop-shadow(1px 0 2px rgba(0,0,0,0.08))' }} />
  }
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingTour({
  isOpen, onClose, onComplete, currentStep = 0, setStep,
}: OnboardingTourProps) {
  const router  = useRouter()
  const locale  = useLocale()
  const t       = useTranslations('tour')
  const tSteps  = useTranslations('tour.steps')

  const [step, setLocalStep] = useState(currentStep)
  const [fading, setFading]  = useState(false)
  const prevPage = useRef<string>('')

  const meta     = STEP_META[step]
  const isLast   = step === STEP_META.length - 1
  const isFirst  = step === 0
  const progress = ((step + 1) / STEP_META.length) * 100
  const stepKey  = STEP_KEY[meta.id as StepId] ?? 'welcome'
  const Icon     = meta.icon

  // Sync external step
  useEffect(() => { setLocalStep(currentStep) }, [currentStep])

  // Navigate to the right page when step changes
  useEffect(() => {
    if (!isOpen || !meta) return
    const targetPath = `/${locale}${meta.page}`
    if (prevPage.current !== meta.page && !window.location.pathname.includes(meta.page)) {
      prevPage.current = meta.page
      router.push(targetPath)
    }
  }, [step, isOpen, meta, router, locale])

  // Restore step from localStorage
  useEffect(() => {
    if (!isOpen) return
    const saved = localStorage.getItem('cn-onboarding-step')
    if (saved !== null) {
      const n = parseInt(saved)
      if (!isNaN(n) && n > 0 && n < STEP_META.length) { setLocalStep(n); setStep?.(n) }
    }
  }, [isOpen])

  const { rect, pos } = useSpotlight(meta?.target ?? '', isOpen && !!(meta?.target))

  const goTo = useCallback((next: number) => {
    setFading(true)
    localStorage.setItem('cn-onboarding-step', String(next))
    setTimeout(() => { setLocalStep(next); setStep?.(next); setFading(false) }, 180)
  }, [setStep])

  const handleNext = useCallback(() => {
    if (isLast) { localStorage.removeItem('cn-onboarding-step'); onComplete() }
    else goTo(step + 1)
  }, [isLast, step, goTo, onComplete])

  const handlePrev = useCallback(() => { if (!isFirst) goTo(step - 1) }, [isFirst, step, goTo])

  const handleSkip = useCallback(() => {
    localStorage.removeItem('cn-onboarding-step')
    onComplete(); onClose()
  }, [onComplete, onClose])

  if (!isOpen || !meta) return null

  const TOOLTIP_W = getTooltipW()
  const PAD_SPOT = 8
  const hasSpot  = !!rect && !!pos

  // Tooltip position
  const tooltipX = hasSpot && pos ? pos.x : window.innerWidth  / 2 - TOOLTIP_W / 2
  const tooltipY = hasSpot && pos ? pos.y : window.innerHeight / 2 - TOOLTIP_H / 2
  const side     = hasSpot && pos ? pos.side : 'center'

  return (
    <>
      {/* ── Overlay ── */}
      {hasSpot && rect ? (
        <>
          {/* 4 dark panels around the spotlight */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }}>
            {/* top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD_SPOT), background: 'rgba(0,0,0,0.6)' }} />
            {/* bottom */}
            <div style={{ position: 'absolute', top: rect.top + rect.height + PAD_SPOT, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }} />
            {/* left */}
            <div style={{ position: 'absolute', top: rect.top - PAD_SPOT, left: 0, width: Math.max(0, rect.left - PAD_SPOT), height: rect.height + PAD_SPOT * 2, background: 'rgba(0,0,0,0.6)' }} />
            {/* right */}
            <div style={{ position: 'absolute', top: rect.top - PAD_SPOT, left: rect.left + rect.width + PAD_SPOT, right: 0, height: rect.height + PAD_SPOT * 2, background: 'rgba(0,0,0,0.6)' }} />
            {/* spotlight border */}
            <div style={{
              position: 'absolute',
              top: rect.top - PAD_SPOT, left: rect.left - PAD_SPOT,
              width: rect.width + PAD_SPOT * 2, height: rect.height + PAD_SPOT * 2,
              borderRadius: 12,
              outline: '2.5px solid rgba(99,102,241,0.9)',
              boxShadow: '0 0 0 4px rgba(99,102,241,0.2)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </>
      ) : (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998, background: 'rgba(0,0,0,0.55)' }} />
      )}

      {/* ── Tooltip ── */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          left: tooltipX,
          top: tooltipY,
          width: TOOLTIP_W,
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(0.97) translateY(4px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease, left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'auto',
        }}
      >
        {/* Arrow pointing to element */}
        {hasSpot && rect && pos && side !== 'center' && (
          <Arrow side={side} rect={rect} tooltipX={tooltipX} tooltipY={tooltipY} tooltipW={TOOLTIP_W} />
        )}

        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {/* Progress bar */}
          <div style={{ height: 3, background: '#f1f5f9' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Header */}
          <div style={{ padding: '12px 12px 10px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: meta.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon style={{ width: 17, height: 17, color: meta.iconColor }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  {step + 1} / {STEP_META.length}
                </span>
                <button onClick={handleSkip} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#d1d5db', padding: 3, borderRadius: 6, lineHeight: 0,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#d1d5db'}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {tSteps(`${stepKey}.title` as any)}
              </h3>
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '0 12px 12px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.55 }}>
              {tSteps(`${stepKey}.description` as any)}
            </p>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, padding: '0 12px 10px' }}>
            {STEP_META.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              }}>
                <div style={{
                  borderRadius: 99,
                  width: i === step ? 14 : 5, height: 5,
                  background: i === step ? '#6366f1' : i < step ? '#a5b4fc' : '#e5e7eb',
                  transition: 'all 0.2s ease',
                }} />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{
            padding: '8px 12px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid #f3f4f6',
          }}>
            <button onClick={handleSkip} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: '#9ca3af', fontWeight: 500,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
            >
              {t('btnSkip')}
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              {!isFirst && (
                <button onClick={handlePrev} disabled={fading} style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '5px 10px', borderRadius: 7, border: '1px solid #e5e7eb',
                  background: '#ffffff', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  color: '#6b7280', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
                >
                  <ChevronLeft style={{ width: 12, height: 12 }} />
                  {t('btnPrev')}
                </button>
              )}
              <button onClick={handleNext} disabled={fading} style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '5px 12px', borderRadius: 7, border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                color: '#ffffff', boxShadow: '0 2px 6px rgba(99,102,241,0.35)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 10px rgba(99,102,241,0.5)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(99,102,241,0.35)'}
              >
                {isLast ? (
                  <><Check style={{ width: 12, height: 12 }} />{t('btnFinish')}</>
                ) : (
                  <>{t('btnNext')}<ChevronRight style={{ width: 12, height: 12 }} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
