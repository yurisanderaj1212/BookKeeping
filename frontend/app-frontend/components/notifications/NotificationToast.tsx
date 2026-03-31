'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Toast } from '@/lib/notificationContext'

export type ToastNotification = Toast & { id: string }

// ─── Config per type ──────────────────────────────────────────────────────────

const CONFIGS = {
  success: {
    icon:    CheckCircle,
    accent:  '#22c55e',
    iconBg:  '#f0fdf4',
    iconFg:  '#16a34a',
    labelKey: 'success' as const,
  },
  error: {
    icon:    AlertCircle,
    accent:  '#ef4444',
    iconBg:  '#fef2f2',
    iconFg:  '#dc2626',
    labelKey: 'error' as const,
  },
  warning: {
    icon:    AlertTriangle,
    accent:  '#f59e0b',
    iconBg:  '#fffbeb',
    iconFg:  '#d97706',
    labelKey: 'warning' as const,
  },
  info: {
    icon:    Info,
    accent:  '#3b82f6',
    iconBg:  '#eff6ff',
    iconFg:  '#2563eb',
    labelKey: 'info' as const,
  },
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const router   = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t        = useTranslations('toast')
  const cfg      = CONFIGS[toast.type]
  const Icon     = cfg.icon
  const dur      = toast.duration ?? 5000

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('idle'), 20)
    timerRef.current = setTimeout(() => dismiss(), dur)
    return () => { clearTimeout(t1); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const dismiss = () => {
    setPhase('exit')
    setTimeout(() => onRemove(toast.id), 320)
  }

  const handleAction = () => {
    if (toast.actionUrl) router.push(toast.actionUrl)
    dismiss()
  }

  const translateX = phase === 'idle' ? '0' : '110%'
  const opacity    = phase === 'idle' ? '1' : '0'

  return (
    <div
      style={{
        width: '340px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        transform: `translateX(${translateX})`,
        opacity,
        transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
        position: 'relative',
        borderLeft: `4px solid ${cfg.accent}`,
      }}
    >
      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#f1f5f9' }}>
        <div
          style={{
            height: '100%',
            background: cfg.accent,
            opacity: 0.5,
            animation: `toast-shrink ${dur}ms linear forwards`,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 14px 16px 14px' }}>
        {/* Icon */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: cfg.iconBg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ width: '18px', height: '18px', color: cfg.iconFg }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: cfg.iconFg }}>
              {t(cfg.labelKey)}
            </span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: '1.3', margin: 0 }}>
            {toast.title}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', lineHeight: '1.4', margin: '3px 0 0' }}>
            {toast.message}
          </p>
          {toast.actionLabel && (
            <button
              onClick={handleAction}
              style={{
                marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600, color: cfg.iconFg,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {toast.actionLabel}
              <ArrowRight style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            flexShrink: 0, width: '24px', height: '24px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9ca3af' }}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// ─── Container ────────────────────────────────────────────────────────────────

interface NotificationToastProps {
  toasts:   Toast[]
  onRemove: (id: string) => void
}

export default function NotificationToast({ toasts, onRemove }: NotificationToastProps) {
  if (!toasts.length) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

