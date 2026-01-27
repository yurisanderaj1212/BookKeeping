'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2,
  Receipt,
  FileText,
  Users,
  Settings,
  Clock,
  AlertTriangle,
  Filter,
  MoreVertical
} from 'lucide-react'
import { 
  mockNotifications,
  getUnreadNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  formatTimestamp,
  getNotificationIcon,
  getNotificationColor,
  type Notification
} from '@/data/notifications-data'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const stats = getNotificationStats()

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    return true
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
      setNotifications([...mockNotifications])
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose()
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    markAsRead(notificationId)
    setNotifications([...mockNotifications])
  }

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    deleteNotification(notificationId)
    setNotifications([...mockNotifications])
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    setNotifications([...mockNotifications])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'transaction':
        return Receipt
      case 'report':
        return FileText
      case 'employee':
        return Users
      case 'system':
        return Settings
      case 'reminder':
        return Clock
      case 'alert':
        return AlertTriangle
      default:
        return Bell
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div 
        ref={dropdownRef}
        className="absolute right-4 top-20 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todas ({stats.total})</option>
              <option value="unread">No leídas ({stats.unread})</option>
              <option value="read">Leídas ({stats.read})</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="transaction">Transacciones ({stats.byType.transaction})</option>
              <option value="report">Reportes ({stats.byType.report})</option>
              <option value="employee">Empleados ({stats.byType.employee})</option>
              <option value="alert">Alertas ({stats.byType.alert})</option>
              <option value="reminder">Recordatorios ({stats.byType.reminder})</option>
              <option value="system">Sistema ({stats.byType.system})</option>
            </select>
          </div>
          
          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay notificaciones</p>
              <p className="text-xs text-gray-400 mt-1">
                {filter === 'unread' ? 'Todas las notificaciones están leídas' : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type)
                const colorClasses = getNotificationColor(notification.priority)
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${colorClasses} flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.actionLabel && (
                                <span className="text-xs text-primary-600 font-medium">
                                  {notification.actionLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                title="Marcar como leída"
                              >
                                <Check className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              title="Eliminar notificación"
                            >
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
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                router.push('/notifications')
                onClose()
              }}
              className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </div>
  )
}