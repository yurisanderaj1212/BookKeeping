'use client'

import { useState } from 'react'
import { HelpCircle, Play, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface HelpButtonProps {
  onStartTour: () => void
}

export default function HelpButton({ onStartTour }: HelpButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const t = useTranslations('help')

  const handleStartTour = () => {
    setShowTooltip(false)
    onStartTour()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
        title={t('btnTitle')}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {showTooltip && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTooltip(false)}
          />

          {/* Tooltip */}
          <div className="absolute right-0 top-12 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 z-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('title')}</h4>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('description')}</p>

            <button
              onClick={handleStartTour}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              <span>{t('btnStartTour')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
