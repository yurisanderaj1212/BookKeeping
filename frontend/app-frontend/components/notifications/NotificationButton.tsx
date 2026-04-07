'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotificationContext } from '@/lib/notificationContext'
import NotificationCenter from './NotificationCenter'

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, refreshUnread } = useNotificationContext()

  const handleOpen = () => {
    setIsOpen(o => !o)
    if (!isOpen) refreshUnread()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
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
        onRefresh={refreshUnread}
      />
    </>
  )
}
