'use client'

import { useState } from 'react'
import { Download, Calendar } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import PageLayout from '@/components/ui/PageLayout'
import MobileMenuButton from '@/components/ui/MobileMenuButton'
import ReportsOverview from '@/components/analytics/ReportsOverview'
import AnnualPerformance from '@/components/analytics/AnnualPerformance'
import WeeklyClosureAnalysis from '@/components/analytics/WeeklyClosureAnalysis'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { exportAnalyticsReport, showExportModal } from '@/services/exportService'

export default function AnalyticsPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('analytics')
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()

  const now = new Date()
  // Default to current month
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const defaultEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0]

  const [startDate, setStartDate] = useState<string | null>(defaultStart)
  const [endDate,   setEndDate]   = useState<string | null>(defaultEnd)

  if (!isAuthenticated && !isLoading) return null

  const handleExportReport = () => {
    showExportModal((format) => {
      exportAnalyticsReport(
        { period: 'month', year: String(now.getFullYear()), month: String(now.getMonth() + 1), week: '1' },
        format,
      )
    })
  }

  const getPeriodLabel = () => {
    if (startDate && endDate) {
      const fmt = (s: string) =>
        new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      return `${fmt(startDate)} – ${fmt(endDate)}`
    }
    if (startDate)
      return new Date(startDate + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    return '—'
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar onLogout={logout} />

      <PageLayout>
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{t('title')}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportReport}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t('exportBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-tour="analytics-main">

          {/* Date Range Filter */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 sm:mb-6 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('period')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getPeriodLabel()}</p>
                </div>
              </div>
              <div className="sm:ml-auto">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
                />
              </div>
            </div>
          </div>

          {/* Analytics Components */}
          <div data-tour="analytics-main">
            <ReportsOverview
              startDate={startDate}
              endDate={endDate}
            />

            <WeeklyClosureAnalysis
              startDate={startDate}
              endDate={endDate}
            />

            <AnnualPerformance
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </PageLayout>

      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        currentStep={onboardingStep}
        setStep={setOnboardingStep}
      />
    </div>
  )
}
