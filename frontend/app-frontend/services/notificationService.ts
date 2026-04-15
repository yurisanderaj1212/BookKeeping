import { getSupabase } from '@/lib/supabaseClient'

export interface Notification {
  id: number
  type: 'transaction' | 'report' | 'system' | 'reminder' | 'alert'
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
  // If the notification has i18n metadata, use the current locale's text
  const locale = typeof window !== 'undefined'
    ? (document.documentElement.lang?.startsWith('en') ? 'en' : 'es')
    : 'es'
  const i18n = r.metadata?.i18n?.[locale]
  return {
    ...r,
    title:       i18n?.title       ?? r.title,
    message:     i18n?.message     ?? r.message,
    actionLabel: i18n?.action_label ?? r.action_label,
    isRead:      r.is_read,
    createdAt:   r.created_at,
    actionUrl:   r.action_url,
  }
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

export async function createNotification(params: {
  type:     Notification['type']
  priority: Notification['priority']
  title:    string
  message:  string
  actionUrl?:   string
  actionLabel?: string
}): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('notifications').insert({
    user_id:      user.id,
    type:         params.type,
    priority:     params.priority,
    title:        params.title,
    message:      params.message,
    action_url:   params.actionUrl ?? null,
    action_label: params.actionLabel ?? null,
    is_read:      false,
  })
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

export function translateNotification(n: Notification, _t?: (key: string, params?: Record<string, string>) => string): { title: string; message: string } {
  // Titles and messages come directly from the DB — no translation needed
  return { title: n.title, message: n.message }
}
