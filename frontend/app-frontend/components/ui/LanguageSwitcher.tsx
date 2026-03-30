'use client'

import { Suspense } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

    const segments = pathname.split('/')
    const knownLocales = ['es', 'en']
    const withoutLocale = knownLocales.includes(segments[1])
      ? '/' + segments.slice(2).join('/')
      : pathname
    const cleanPath = withoutLocale || '/'

    // Preservar query params al cambiar de idioma
    const qs = searchParams.toString()
    const fullPath = qs ? `${cleanPath}?${qs}` : cleanPath

    router.push(newLocale === 'es' ? fullPath : `/${newLocale}${fullPath}`)
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
                    : 'text-gray-500 hover:text-gray-800'
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

  // compact variant — used inside Sidebar
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
                : 'text-gray-400 hover:text-gray-600'
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
