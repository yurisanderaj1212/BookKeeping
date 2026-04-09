'use client'

import { getLocalPreferences } from '@/services/userService'

export function useLanguage() {
  // Read from localStorage preferences, fallback to URL locale, then 'en'
  const getLanguage = (): 'en' | 'es' => {
    if (typeof window === 'undefined') return 'en'
    const stored = getLocalPreferences().language
    if (stored === 'en' || stored === 'es') return stored
    // Detect from URL
    return window.location.pathname.startsWith('/en') ? 'en' : 'es'
  }

  return {
    language: getLanguage(),
  }
}
