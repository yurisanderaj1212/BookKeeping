'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { getSupabase } from '@/lib/supabaseClient'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id:           string
  type:         ToastType
  title:        string
  message:      string
  duration?:    number
  actionLabel?: string
  actionUrl?:   string
}

interface NotificationContextValue {
  toasts:        Toast[]
  unreadCount:   number
  addToast:      (toast: Omit<Toast, 'id'>) => void
  removeToast:   (id: string) => void
  markAllRead:   () => void
  refreshUnread: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider')
  return ctx
}

// ─── ISO week key — used to avoid duplicate weekly reminders ─────────────────
function getISOWeekKey(): string {
  const now  = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const week = Math.floor((now.getTime() - startOfWeek1.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `weekly-report-reminder-${now.getFullYear()}-W${week}`
}

function isEndOfWeek(): boolean {
  return new Date().getDay() === 0  // Sunday
}

// ─── Check if today is Friday (5) or Saturday (6) — warn about open weeks ────
function isWeekEndingWarning(): boolean {
  const day = new Date().getDay()
  return day === 5 || day === 6
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts]           = useState<Toast[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const lastSeenIdRef = useRef<number>(0)
  const pollingRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev.slice(-4), { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const supabase = getSupabase()
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
      setUnreadCount(0)
    } catch { /* silencioso */ }
  }, [])

  // ─── Week-ending warning: Friday/Saturday, open weeks exist ─────────────────
  const checkWeekEndingWarning = useCallback(async () => {
    if (!isWeekEndingWarning()) return
    const now = new Date()
    const warningKey = `week-ending-warning-${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`
    if (localStorage.getItem(warningKey)) return

    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if current week has a closure record
      const year  = now.getFullYear()
      const month = now.getMonth() + 1
      // Get start of current week (Sunday)
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay()) // go back to Sunday
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const { data: existing } = await supabase
        .from('week_closures')
        .select('id')
        .eq('year', year)
        .eq('month', month)
        .gte('start_date', weekStartStr)
        .limit(1)

      if (existing && existing.length > 0) return  // already closed

      // Insert warning notification
      await supabase.from('notifications').insert({
        user_id:      user.id,
        type:         'reminder',
        priority:     'high',
        title:        '⚠️ Semana por cerrar',
        message:      'La semana actual termina pronto y aún no ha sido cerrada. Recuerda hacer el cierre semanal para mantener la integridad de tus datos.',
        action_url:   '/reports/week-close',
        action_label: 'Cerrar semana',
        is_read:      false,
      })
      localStorage.setItem(warningKey, '1')
    } catch { /* silencioso */ }
  }, [])

  // ─── Weekly report reminder (client-side, Sunday only, once per week) ──────
  const checkWeeklyReminder = useCallback(async () => {
    if (!isEndOfWeek()) return
    const key = getISOWeekKey()
    if (localStorage.getItem(key)) return

    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('notifications').insert({
        user_id:      user.id,
        type:         'reminder',
        priority:     'medium',
        title:        '📊 Reportes pendientes',
        message:      'Es el final de la semana. Recuerda generar tus reportes financieros semanales.',
        action_url:   '/reports',
        action_label: 'Ver reportes',
        is_read:      false,
      })
      localStorage.setItem(key, '1')
    } catch { /* silencioso */ }
  }, [])

  // ─── Core polling — detects new DB notifications and shows toasts ──────────
  const poll = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('is_read', false)
        .order('id', { ascending: false })
        .limit(10)

      setUnreadCount(count ?? 0)
      if (!data?.length) return

      const maxId = data[0].id as number
      if (lastSeenIdRef.current === 0) {
        lastSeenIdRef.current = maxId
        return
      }

      const newOnes = data.filter((n: any) => n.id > lastSeenIdRef.current)
      if (newOnes.length > 0) {
        lastSeenIdRef.current = maxId
        newOnes.slice(0, 3).forEach((n: any, i: number) => {
          setTimeout(() => {
            addToast({
              type:        n.priority === 'urgent' ? 'error' : n.priority === 'high' ? 'warning' : n.type === 'alert' ? 'warning' : 'info',
              title:       n.title,
              message:     n.message,
              duration:    n.priority === 'urgent' ? 10000 : 6000,
              actionLabel: n.action_label ?? undefined,
              actionUrl:   n.action_url ?? undefined,
            })
          }, i * 400)
        })
      }
    } catch { /* silencioso */ }
  }, [addToast])

  const refreshUnread = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
      setUnreadCount(count ?? 0)
    } catch { /* silencioso */ }
  }, [])

  // ─── Report Reminder — 1st of each month ─────────────────────────────────
  const checkMonthlyReportReminder = useCallback(async () => {
    const now = new Date()
    if (now.getDate() !== 1) return  // only on the 1st
    const key = `monthly-report-reminder-${now.getFullYear()}-${now.getMonth() + 1}`
    if (localStorage.getItem(key)) return

    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user has reportReminders enabled
      const prefs = JSON.parse(localStorage.getItem('bookkeeping_preferences') || '{}')
      if (prefs?.notifications?.reportReminders === false) return

      const locale = document.documentElement.lang?.startsWith('en') ? 'en' : 'es'
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })

      await supabase.from('notifications').insert({
        user_id:      user.id,
        type:         'reminder',
        priority:     'medium',
        title:        locale === 'en' ? '📊 Monthly report ready' : '📊 Reporte mensual listo',
        message:      locale === 'en'
          ? `The month of ${prevMonth} has ended. Generate your financial report to review your results.`
          : `El mes de ${prevMonth} ha terminado. Genera tu reporte financiero para revisar tus resultados.`,
        action_url:   '/reports',
        action_label: locale === 'en' ? 'Generate report' : 'Generar reporte',
        is_read:      false,
      })
      localStorage.setItem(key, '1')
    } catch { /* silencioso */ }
  }, [])

  // ─── Low Balance Alert — check all accounts ────────────────────────────────
  const checkLowBalance = useCallback(async () => {
    const key = `low-balance-check-${new Date().toISOString().split('T')[0]}`
    if (localStorage.getItem(key)) return

    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user has lowBalanceAlerts enabled
      const prefs = JSON.parse(localStorage.getItem('bookkeeping_preferences') || '{}')
      if (prefs?.notifications?.lowBalanceAlerts === false) return

      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, name, current_balance, sub_type, currency')
        .eq('is_active', true)
        .lt('current_balance', 100)  // below $100 threshold
        .neq('sub_type', 1002)       // exclude Cash (sub_type 1002)

      if (!accounts?.length) {
        localStorage.setItem(key, '1')
        return
      }

      const locale = document.documentElement.lang?.startsWith('en') ? 'en' : 'es'

      for (const acc of accounts) {
        const name = acc.sub_type === 1002 ? (locale === 'en' ? 'Cash' : 'Efectivo') : acc.name
        const balance = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
          style: 'currency', currency: acc.currency ?? 'USD'
        }).format(acc.current_balance)

        await supabase.from('notifications').insert({
          user_id:      user.id,
          type:         'alert',
          priority:     'high',
          title:        locale === 'en' ? '⚠️ Low balance alert' : '⚠️ Alerta de saldo bajo',
          message:      locale === 'en'
            ? `Account "${name}" has a low balance of ${balance}.`
            : `La cuenta "${name}" tiene un saldo bajo de ${balance}.`,
          action_url:   '/accounts',
          action_label: locale === 'en' ? 'View accounts' : 'Ver cuentas',
          is_read:      false,
        })
      }
      localStorage.setItem(key, '1')
    } catch { /* silencioso */ }
  }, [])
  const checkPendingTransactions = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
      const cutoff72h = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()

      // Find pending transactions created 48-72h ago
      const { data: pending } = await supabase
        .from('transactions')
        .select('id, description, amount, created_at')
        .eq('status', 1) // pending
        .lte('created_at', cutoff48h)
        .gte('created_at', cutoff72h)
        .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
        .limit(5)

      if (!pending?.length) return

      // Check if we already sent this notification today
      const notifKey = `pending-tx-reminder-${now.toISOString().split('T')[0]}`
      if (localStorage.getItem(notifKey)) return

      const count = pending.length
      const locale = document.documentElement.lang?.startsWith('en') ? 'en' : 'es'
      const title = locale === 'en'
        ? `⏳ ${count} pending transaction${count > 1 ? 's' : ''}`
        : `⏳ ${count} transacción${count > 1 ? 'es' : ''} pendiente${count > 1 ? 's' : ''}`
      const message = locale === 'en'
        ? `You have ${count} transaction${count > 1 ? 's' : ''} pending for over 48 hours. Did ${count > 1 ? 'they' : 'it'} complete?`
        : `Tienes ${count} transacción${count > 1 ? 'es' : ''} pendiente${count > 1 ? 's' : ''} por más de 48 horas. ¿Ya se completó${count > 1 ? 'n' : ''}?`

      await supabase.from('notifications').insert({
        user_id:      user.id,
        type:         'reminder',
        priority:     'medium',
        title,
        message,
        action_url:   '/transactions',
        action_label: locale === 'en' ? 'View transactions' : 'Ver transacciones',
        is_read:      false,
      })
      localStorage.setItem(notifKey, '1')
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    const init = setTimeout(() => {
      poll()
      checkWeeklyReminder()
      checkWeekEndingWarning()
      checkPendingTransactions()
      checkMonthlyReportReminder()
      checkLowBalance()
    }, 1500)
    pollingRef.current = setInterval(poll, 5000)

    return () => {
      clearTimeout(init)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [poll, checkWeeklyReminder, checkWeekEndingWarning, checkPendingTransactions, checkMonthlyReportReminder, checkLowBalance])

  return (
    <NotificationContext.Provider value={{ toasts, unreadCount, addToast, removeToast, markAllRead, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}
