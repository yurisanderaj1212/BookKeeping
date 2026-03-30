'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Bell, X, Check, CheckCheck, Trash2,
  Receipt, FileText, Users, Settings, Clock, AlertTriangle,
} from 'lucide-react'
import {
  markAsRead, markAllAsRead, deleteNotification,
  getNotificationColor, formatTimestamp,
  type Notification,
} from '@/services/notificationService'

interface Props {
  isOpen:        boolean
  onClose:       () => void
  notifications: Notification[]
  onRefresh:     () => void
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

export default function NotificationCenter({ isOpen, onClose, notifications, onRefresh }: Props) {
  const router  = useRouter()
  const locale  = useLocale()
  const ref     = useRef<HTMLDivElement>(null)
  const [filter, setFilter]     = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState('all')

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
      <div
        ref={ref}
        className="absolute right-4 top-20 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unread}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas ({total})</option>
              <option value="unread">No leídas ({unread})</option>
              <option value="read">Leídas ({total - unread})</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="transaction">Transacciones</option>
              <option value="report">Reportes</option>
              <option value="employee">Empleados</option>
              <option value="alert">Alertas</option>
              <option value="reminder">Recordatorios</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> Marcar todas como leídas
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay notificaciones</p>
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
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
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
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => { router.push(`/${locale}/notifications`); onClose() }}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas las notificaciones →
          </button>
        </div>
      </div>
    </div>
  )
}
