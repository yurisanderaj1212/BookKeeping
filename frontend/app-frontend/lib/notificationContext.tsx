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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts]           = useState<Toast[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  // Track the latest notification id we've seen to detect new ones
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

  // Core polling function — checks for new notifications since last seen
  const poll = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all unread notifications
      const { data, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('is_read', false)
        .order('id', { ascending: false })
        .limit(10)

      setUnreadCount(count ?? 0)

      if (!data?.length) return

      // Find notifications newer than what we've seen
      const maxId = data[0].id as number
      if (lastSeenIdRef.current === 0) {
        // First poll — just record the max id, don't show toasts for existing ones
        lastSeenIdRef.current = maxId
        return
      }

      // Show toasts for new notifications
      const newOnes = data.filter((n: any) => n.id > lastSeenIdRef.current)
      if (newOnes.length > 0) {
        lastSeenIdRef.current = maxId
        // Show up to 3 toasts at once, staggered
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

  useEffect(() => {
    // Initial poll after a short delay (wait for auth)
    const init = setTimeout(() => poll(), 1500)
    // Poll every 5 seconds for near-realtime feel
    pollingRef.current = setInterval(poll, 5000)

    return () => {
      clearTimeout(init)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [poll])

  return (
    <NotificationContext.Provider value={{ toasts, unreadCount, addToast, removeToast, markAllRead, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}
