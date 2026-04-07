'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Bell, X, Check, CheckCheck, Trash2,
  Receipt, FileText, Users, Settings, Clock, AlertTriangle,
} from 'lucide-react'
import {
  markAsRead, markAllAsRead, deleteNotification,
  getNotificationColor, formatTimestamp, getNotifications,
  type Notification,
} from '@/services/notificationService'

interface Props {
  isOpen:    boolean
  onClose:   () => void
  onRefresh: () => void
}

function getIcon(type: Notification['type']) {
  switch (type) {
    case 'transaction': return Receipt
    case 'report':      return FileText
    case 'employee':    return Users
    case 'system':      return Settings
    case 'reminder':    return Clock
    case 'alert':       return AlertTriangle
    default:            return Bell
  }
}

export default function NotificationCenter({ isOpen, onClose, onRefresh }: Props) {
  const router  = useRouter()
  const locale  = useLocale()
  const t       = useTranslations('notificationCenter')
  const tCommon = useTranslations('common')
  const ref     = useRef<HTMLDivElement>(null)
  const [filter, setFilter]     = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (isOpen) {
      getNotifications().then(setNotifications).catch(() => {})
    }
  }, [isOpen])

  const unread = notifications.filter(n => !n.isRead).length
  const total  = notifications.length

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.isRead)  return false
    if (filter === 'read'   && !n.isRead) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    return true
  })

  const handleClick = useCallback(async (n: Notification) => {
    if (!n.isRead) { await markAsRead(n.id); onRefresh() }
    if (n.actionUrl) { router.push(`/${locale}${n.actionUrl}`); onClose() }
  }, [locale, router, onClose, onRefresh])

  const handleMarkRead = useCallback(async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await markAsRead(id)
    onRefresh()
  }, [onRefresh])

  const handleDelete = useCallback(async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await deleteNotification(id)
    onRefresh()
  }, [onRefresh])

  const handleMarkAll = useCallback(async () => {
    await markAllAsRead()
    onRefresh()
  }, [onRefresh])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop on mobile */}
      <div className="absolute inset-0 sm:hidden pointer-events-auto" onClick={onClose} />
      <div
        ref={ref}
        className="absolute right-0 sm:right-4 top-0 sm:top-20 w-full sm:w-96 max-h-screen sm:max-h-[80vh] bg-white sm:rounded-lg shadow-xl border-0 sm:border border-gray-200 flex flex-col pointer-events-auto"
        style={{ maxHeight: '100dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">{t('title')}</h3>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="flex-1 min-w-[120px] text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">{t('all')} ({total})</option>
              <option value="unread">{t('unread')} ({unread})</option>
              <option value="read">{t('read')} ({total - unread})</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="flex-1 min-w-[120px] text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="transaction">{t('typeTransaction')}</option>
              <option value="report">{t('typeReport')}</option>
              <option value="employee">{t('typeEmployee')}</option>
              <option value="alert">{t('typeAlert')}</option>
              <option value="reminder">{t('typeReminder')}</option>
              <option value="system">{t('typeSystem')}</option>
            </select>
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll} className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> {t('markAllRead')}
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">{t('empty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(n => {
                const Icon = getIcon(n.type)
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full shrink-0 ${getNotificationColor(n.priority)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimestamp(n.createdAt, locale)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!n.isRead && (
                              <button onClick={e => handleMarkRead(e, n.id)} className="p-1 hover:bg-gray-200 rounded-full" title="Marcar como leída">
                                <Check className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                            <button onClick={e => handleDelete(e, n.id)} className="p-1 hover:bg-gray-200 rounded-full" title="Eliminar">
                              <Trash2 className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50">
          <button
            onClick={() => { router.push(`/${locale}/notifications`); onClose() }}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('viewAll')} →
          </button>
        </div>
      </div>
    </div>
  )
}
