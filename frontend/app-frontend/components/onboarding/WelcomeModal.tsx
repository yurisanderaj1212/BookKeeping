'use client'

import { Play, ArrowRight, X, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTour: () => void
  userName?: string
}

export default function WelcomeModal({ isOpen, onClose, onStartTour, userName }: WelcomeModalProps) {
  const t = useTranslations('welcomeModal')

  if (!isOpen) return null

  const handleStartTour = () => { onStartTour(); onClose() }

  const features = [
    { emoji: '🏦', label: t('featureAccounts') },
    { emoji: '💰', label: t('featureExpenses') },
    { emoji: '📊', label: t('featureReports') },
    { emoji: '📈', label: t('featureAnalytics') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-linear-to-r from-primary-500 to-primary-600 px-5 py-4 text-white">
          <button onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-tight">{t('title')}</h2>
              <p className="text-primary-100 text-xs mt-0.5">
                {userName ? t('subtitle', { name: userName }) : t('title')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <div className="text-center mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">{t('heading')}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{t('description')}</p>
          </div>

          {/* Features grid — compact */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {features.map(f => (
              <div key={f.label} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">{f.emoji}</div>
                <p className="text-xs font-medium text-gray-600 leading-tight">{f.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <button onClick={handleStartTour}
              className="w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5" />
              {t('btnTour')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 transition-colors text-xs font-medium py-1.5">
              {t('btnSkip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
