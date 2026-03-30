'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, type Notification } from '@/services/notificationService'
import NotificationCenter from './NotificationCenter'

export default function NotificationButton() {
  const [isOpen, setIsOpen]           = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const load = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <>
      <button
        onClick={() => { setIsOpen(o => !o); if (!isOpen) load() }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Notificaciones"
        data-tour="notification-btn"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onRefresh={load}
      />
    </>
  )
}
