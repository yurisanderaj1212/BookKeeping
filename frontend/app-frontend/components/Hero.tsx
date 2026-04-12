'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe, X, Menu } from 'lucide-react'
import LandingNav from '@/components/LandingNav'

export default function Hero() {
  const locale   = useLocale()
  const router   = useRouter()
  const pathname = usePathname()
  const t  = useTranslations('landing')
  const tn = useTranslations('landing.nav')

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative bg-linear-to-br from-blue-900 via-blue-800 to-indigo-800 min-h-screen">

      {/* ── Navigation ── */}
      <LandingNav />

      {/* ── Hero Section ── */}
      <div className="relative px-6 py-32 lg:px-8 flex items-center min-h-screen">
        <div className="mx-auto max-w-4xl text-center w-full">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t('hero.title')}
            <br />
            <span className="text-blue-200">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-8 text-blue-200 max-w-2xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/auth/register"
              className="w-full sm:w-auto bg-primary-500 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-primary-600 rounded-lg transition-all duration-200 text-center">
              {t('hero.cta')}
            </Link>
            <button onClick={() => scrollTo('features')}
              className="w-full sm:w-auto text-base font-semibold leading-6 text-blue-100 hover:text-white transition-colors cursor-pointer py-3.5 px-4 rounded-lg hover:bg-white dark:bg-gray-900/10">
              {t('hero.learnMore')} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
