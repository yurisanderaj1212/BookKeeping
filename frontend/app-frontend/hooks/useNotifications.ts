'use client'

import { useCallback } from 'react'
import { useNotificationContext } from '@/lib/notificationContext'

/**
 * Convenience hook for showing toast notifications from anywhere in the app.
 * Wraps the global NotificationContext.
 */
export function useNotifications() {
  const { addToast, unreadCount, refreshUnread } = useNotificationContext()

  const showSuccess = useCallback((title: string, message: string) =>
    addToast({ type: 'success', title, message }), [addToast])

  const showError = useCallback((title: string, message: string) =>
    addToast({ type: 'error', title, message, duration: 7000 }), [addToast])

  const showWarning = useCallback((title: string, message: string) =>
    addToast({ type: 'warning', title, message }), [addToast])

  const showInfo = useCallback((title: string, message: string) =>
    addToast({ type: 'info', title, message }), [addToast])

  return { showSuccess, showError, showWarning, showInfo, unreadCount, refreshUnread }
}
