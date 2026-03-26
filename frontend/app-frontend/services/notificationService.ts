import { apiClient } from '@/lib/apiClient'

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

export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await apiClient<any[]>('/notifications')
    return data.map(n => ({
      id: n.id,
      type: n.type ?? 'system',
      priority: n.priority ?? 'medium',
      title: n.title ?? '',
      message: n.message ?? '',
      isRead: n.isRead ?? n.read ?? false,
      createdAt: n.createdAt ?? n.timestamp ?? new Date().toISOString(),
      actionUrl: n.actionUrl,
      actionLabel: n.actionLabel,
      metadata: n.metadata,
    }))
  } catch {
    return []
  }
}

export async function getStats(): Promise<NotificationStats> {
  try {
    return await apiClient<NotificationStats>('/notifications/stats')
  } catch {
    return { total: 0, unread: 0, read: 0, byType: {}, byPriority: {} }
  }
}

export async function markAsRead(id: number): Promise<void> {
  await apiClient(`/notifications/${id}/read`, { method: 'PUT' })
}

export async function markAllAsRead(): Promise<void> {
  await apiClient('/notifications/read-all', { method: 'PUT' })
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient(`/notifications/${id}`, { method: 'DELETE' })
}

export async function deleteAllRead(): Promise<void> {
  await apiClient('/notifications/read', { method: 'DELETE' })
}

export function formatTimestamp(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === 'es' ? 'es' : 'en')
  } catch {
    return iso
  }
}

export function getNotificationColor(priority: Notification['priority']): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-600'
    case 'high':   return 'bg-orange-100 text-orange-600'
    case 'medium': return 'bg-blue-100 text-blue-600'
    default:       return 'bg-gray-100 text-gray-600'
  }
}

export function translateNotification(
  n: Notification,
  t: (key: string, params?: Record<string, string>) => string
): { title: string; message: string } {
  try {
    const title = t(`${n.type}.title`, n.metadata as Record<string, string> ?? {})
    const message = t(`${n.type}.message`, n.metadata as Record<string, string> ?? {})
    return { title: title || n.title, message: message || n.message }
  } catch {
    return { title: n.title, message: n.message }
  }
}
