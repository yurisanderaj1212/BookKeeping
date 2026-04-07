'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CTA() {
  const t = useTranslations('landing')

  return (
    <div className="bg-primary-500">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('cta.title')}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">{t('cta.subtitle')}</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/register"
              className="bg-white dark:bg-gray-900 px-8 py-3 text-lg font-semibold text-primary-600 shadow-sm hover:bg-primary-50 rounded-lg transition-all duration-200 hover:shadow-medium">
              {t('cta.btn')}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-linear-to-br from-blue-900 via-blue-800 to-indigo-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CN</span>
              </div>
              <span className="text-lg font-bold text-white">Chill Numbers</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-blue-200 hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <Link href="/terms"   className="text-blue-200 hover:text-white transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-blue-700 pt-8">
            <p className="text-center text-sm text-blue-200">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
