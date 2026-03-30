'use client'

import { useNotificationContext } from '@/lib/notificationContext'
import NotificationToast from './NotificationToast'

export default function GlobalToastContainer() {
  const { toasts, removeToast } = useNotificationContext()
  return <NotificationToast toasts={toasts} onRemove={removeToast} />
}
