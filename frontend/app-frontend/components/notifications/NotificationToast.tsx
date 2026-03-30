'use client'

import { useState, useEffect } from 'react'
import { X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationToastProps {
  notifications: ToastNotification[]
  onRemove: (id: string) => void
}

export default function NotificationToast({ notifications, onRemove }: NotificationToastProps) {
  const getIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'error':
        return AlertTriangle
      case 'warning':
        return AlertTriangle
      case 'info':
        return Info
      default:
        return Info
    }
  }

  const getStyles = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIconStyles = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type)
        const styles = getStyles(notification.type)
        const iconStyles = getIconStyles(notification.type)

        return (
          <ToastItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            Icon={Icon}
            styles={styles}
            iconStyles={iconStyles}
          />
        )
      })}
    </div>
  )
}

interface ToastItemProps {
  notification: ToastNotification
  onRemove: (id: string) => void
  Icon: React.ComponentType<{ className?: string }>
  styles: string
  iconStyles: string
}

function ToastItem({ notification, onRemove, Icon, styles, iconStyles }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto remove after duration
    const duration = notification.duration || 5000
    const removeTimer = setTimeout(() => {
      handleRemove()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [notification.duration])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }

  return (
    <div
      className={`
        max-w-sm w-full border rounded-lg shadow-lg p-4 transition-all duration-300 transform
        ${styles}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconStyles}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium mb-1">
            {notification.title}
          </h4>
          <p className="text-sm opacity-90">
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleRemove}
          className="shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}