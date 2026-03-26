'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

// Legacy single-toast state (compatibilidad con código viejo)
interface ToastState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
}

export function useToast() {
  // Multi-toast (nuevo)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Single-toast legacy
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false })

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    // también actualizar el toast legacy
    setToast({ message, type, isVisible: true })
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error   = useCallback((message: string) => addToast(message, 'error'),   [addToast])
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast])
  const info    = useCallback((message: string) => addToast(message, 'info'),    [addToast])

  // Legacy aliases
  const showToast    = addToast
  const showSuccess  = success
  const showError    = error
  const showWarning  = warning
  const showInfo     = info
  const hideToast    = useCallback(() => setToast(prev => ({ ...prev, isVisible: false })), [])

  return {
    // Multi-toast API (nuevo)
    toasts,
    dismiss,
    success,
    error,
    warning,
    info,
    // Legacy API
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
