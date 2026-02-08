'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { getUnreadNotifications } from '@/data/notifications-data'
import NotificationCenter from './NotificationCenter'

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateUnreadCount = () => {
      const unread = getUnreadNotifications()
      setUnreadCount(unread.length)
    }

    updateUnreadCount()
    
    // Update count every 30 seconds (in a real app, this would be event-driven)
    const interval = setInterval(updateUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    // Update count when opening
    if (!isOpen) {
      const unread = getUnreadNotifications()
      setUnreadCount(unread.length)
    }
  }

  return (
    <>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Notificaciones"
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
      />
    </>
  )
}