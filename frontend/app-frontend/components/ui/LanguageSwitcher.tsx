'use client'

import { Suspense } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full'
  className?: string
}

const LOCALES = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
]

function LanguageSwitcherInner({ variant = 'compact', className = '' }: LanguageSwitcherProps) {
  const locale   = useLocale()
  const router   = useRouter()
  const pathname = usePathname()

  const switchLocale = async (newLocale: string) => {
    if (newLocale === locale) return
    // 1. Save in NEXT_LOCALE cookie — next-intl middleware reads this on every request
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    // 2. Save in Supabase user_metadata if authenticated (syncs across devices)
    try {
      const { getSupabase } = await import('@/lib/supabaseClient')
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({ data: { preferred_locale: newLocale } })
      }
    } catch { /* silencioso */ }
    // 3. Use next-intl router — correctly handles locale prefix in URL
    router.replace(pathname as any, { locale: newLocale })
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-1">
          {LOCALES.map((l, i) => (
            <span key={l.code} className="flex items-center">
              {i > 0 && <span className="text-gray-300 mx-1 text-xs">|</span>}
              <button
                onClick={() => switchLocale(l.code)}
                className={`text-sm px-1 py-0.5 rounded transition-colors ${
                  locale === l.code
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200'
                }`}
              >
                {l.label}
              </button>
            </span>
          ))}
        </div>
      </div>
    )
  }

  // compact variant
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      {LOCALES.map((l, i) => (
        <span key={l.code} className="flex items-center">
          {i > 0 && <span className="text-gray-300 text-xs">|</span>}
          <button
            onClick={() => switchLocale(l.code)}
            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
              locale === l.code
                ? 'bg-primary-100 text-primary-700 font-semibold'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-400'
            }`}
          >
            {l.short}
          </button>
        </span>
      ))}
    </div>
  )
}

export default function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherInner {...props} />
    </Suspense>
  )
}
