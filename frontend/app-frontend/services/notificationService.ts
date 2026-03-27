import { getSupabase } from '@/lib/supabaseClient'

export interface Notification {
  id: number
  type: 'transaction' | 'report' | 'employee' | 'system' | 'reminder' | 'alert'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

function mapNotif(r: any): Notification {
  return { ...r, isRead: r.is_read, createdAt: r.created_at, actionUrl: r.action_url, actionLabel: r.action_label }
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('notifications').select('*').order('created_at', { ascending: false }).limit(100)
  if (error) return []
  return (data ?? []).map(mapNotif)
}

export async function getStats(): Promise<NotificationStats> {
  const notifs = await getNotifications()
  const byType: Record<string, number> = {}
  const byPriority: Record<string, number> = {}
  notifs.forEach(n => {
    byType[n.type] = (byType[n.type] ?? 0) + 1
    byPriority[n.priority] = (byPriority[n.priority] ?? 0) + 1
  })
  return {
    total: notifs.length,
    unread: notifs.filter(n => !n.isRead).length,
    read: notifs.filter(n => n.isRead).length,
    byType, byPriority
  }
}

export async function markAsRead(id: number): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function markAllAsRead(): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
}

export async function deleteNotification(id: number): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('notifications').delete().eq('id', id)
}

export async function deleteAllRead(): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('notifications').delete().eq('is_read', true)
}

export function formatTimestamp(iso: string, locale: string): string {
  try { return new Date(iso).toLocaleString(locale === 'es' ? 'es' : 'en') } catch { return iso }
}

export function getNotificationColor(priority: Notification['priority']): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-600'
    case 'high':   return 'bg-orange-100 text-orange-600'
    case 'medium': return 'bg-blue-100 text-blue-600'
    default:       return 'bg-gray-100 text-gray-600'
  }
}

export function translateNotification(n: Notification, t: (key: string, params?: Record<string, string>) => string): { title: string; message: string } {
  try {
    const title = t(`${n.type}.title`, n.metadata as Record<string, string> ?? {})
    const message = t(`${n.type}.message`, n.metadata as Record<string, string> ?? {})
    return { title: title || n.title, message: message || n.message }
  } catch { return { title: n.title, message: n.message } }
}
