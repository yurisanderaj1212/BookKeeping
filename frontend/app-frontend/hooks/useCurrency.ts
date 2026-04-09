'use client'

import { useState, useEffect } from 'react'
import { getLocalPreferences, saveLocalPreferences } from '@/services/userService'
import { useLocale } from 'next-intl'

export type SupportedCurrency = 'USD' | 'EUR' | 'MXN' | 'COP'

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  MXN: 'es-MX',
  COP: 'es-CO',
}

export function useCurrency() {
  const locale = useLocale()
  const [currency, setCurrencyState] = useState<SupportedCurrency>('USD')

  useEffect(() => {
    const stored = getLocalPreferences().currency as SupportedCurrency
    if (stored && ['USD', 'EUR', 'MXN', 'COP'].includes(stored)) {
      setCurrencyState(stored)
    }
    // Listen for currency changes from Settings
    const handler = (e: Event) => {
      const c = (e as CustomEvent).detail as SupportedCurrency
      if (c && ['USD', 'EUR', 'MXN', 'COP'].includes(c)) setCurrencyState(c)
    }
    window.addEventListener('currency-changed', handler)
    return () => window.removeEventListener('currency-changed', handler)
  }, [])

  const setCurrency = (c: SupportedCurrency) => {
    saveLocalPreferences({ currency: c })
    setCurrencyState(c)
    // Dispatch event so other components can react without re-mounting
    window.dispatchEvent(new CustomEvent('currency-changed', { detail: c }))
  }

  const formatCurrency = (amount: number) => {
    const numberLocale = CURRENCY_LOCALES[currency] ?? (locale === 'en' ? 'en-US' : 'es-ES')
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return { currency, setCurrency, formatCurrency }
}

// Standalone formatter — for components that can't use hooks (e.g. exportService)
export function formatCurrencyStatic(amount: number, currency?: string): string {
  const c = (currency ?? getLocalPreferences().currency ?? 'USD') as SupportedCurrency
  const numberLocale = CURRENCY_LOCALES[c] ?? 'en-US'
  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: c,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
