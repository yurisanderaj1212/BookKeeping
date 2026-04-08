'use client'

import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'

interface SessionWarningModalProps {
  secondsLeft: number
  onExtend: () => void
  onLogout: () => void
}

export default function SessionWarningModal({ secondsLeft, onExtend, onLogout }: SessionWarningModalProps) {
  const t = useTranslations('session')

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('warningTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('warningDesc')}
        </p>

        {/* Countdown */}
        <div className="text-4xl font-black text-amber-600 dark:text-amber-400 my-4 tabular-nums">
          {secondsLeft}s
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('logoutNow')}
          </button>
          <button
            onClick={onExtend}
            className="flex-1 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t('continueSession')}
          </button>
        </div>
      </div>
    </div>
  )
}
