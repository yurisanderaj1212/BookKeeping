'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLocalPreferences, saveLocalPreferences } from '@/services/userService'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme   = 'light' | 'dark'

export interface UseThemeReturn {
  /** The resolved theme after applying system preference */
  theme: ResolvedTheme
  /** The raw stored preference */
  preference: ThemePreference
  /** Update preference, persist to LocalPreferences, apply to <html> */
  setTheme: (p: ThemePreference) => void
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = preference === 'system' ? getSystemTheme() : preference
  if (typeof document !== 'undefined') {
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  return resolved
}

export function useTheme(): UseThemeReturn {
  const [preference, setPreference] = useState<ThemePreference>('system')
  const [theme, setResolvedTheme]   = useState<ResolvedTheme>('light')

  // On mount — read stored preference and apply
  useEffect(() => {
    const stored = getLocalPreferences().theme ?? 'system'
    setPreference(stored)
    const resolved = applyTheme(stored)
    setResolvedTheme(resolved)
  }, [])

  // Listen for OS preference changes when preference === 'system'
  useEffect(() => {
    if (preference !== 'system') return
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolved = applyTheme('system')
      setResolvedTheme(resolved)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = useCallback((p: ThemePreference) => {
    saveLocalPreferences({ theme: p })
    setPreference(p)
    const resolved = applyTheme(p)
    setResolvedTheme(resolved)
  }, [])

  return { theme, preference, setTheme }
}
