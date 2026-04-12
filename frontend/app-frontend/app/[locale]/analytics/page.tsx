'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
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
import YearComparison from '@/components/analytics/YearComparison'
import { getTransactionSummary } from '@/services/reportService'
import { exportAnalyticsReport, showExportModal } from '@/services/exportService'

export default function ReportsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('analytics')
  const tReports = useTranslations('reports')
  const now = new Date()
  const defaultWeek = (() => {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstSunday = new Date(firstDay)
    firstSunday.setDate(firstDay.getDate() - firstDay.getDay())
    const diffDays = Math.floor((now.getTime() - firstSunday.getTime()) / 86400000)
    return String(Math.floor(diffDays / 7) + 1)
  })()

  // Restore period state from sessionStorage when navigating back from a sub-report
  // Reset to current date when entering from outside the reports section
  const SESSION_KEY = 'analytics_period_state'
  const getInitialState = () => {
    if (typeof window === 'undefined') return null
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return null
  }
  const saved = getInitialState()

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>(saved?.period ?? 'week')
  const [selectedYear, setSelectedYear] = useState(saved?.year ?? String(now.getFullYear()))
  const [selectedMonth, setSelectedMonth] = useState(saved?.month ?? String(now.getMonth() + 1).padStart(2, '0'))
  const [selectedWeek, setSelectedWeek] = useState(saved?.week ?? defaultWeek)
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()

  const [transactionStats, setTransactionStats] = useState({ totalTransactions: 0, pendingCount: 0 })

  // Persist period state in sessionStorage so it survives sub-report navigation
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        period: selectedPeriod, year: selectedYear, month: selectedMonth, week: selectedWeek,
      }))
    } catch { /* ignore */ }
  }, [selectedPeriod, selectedYear, selectedMonth, selectedWeek])

  useEffect(() => {
    const y = parseInt(selectedYear)
    const m = parseInt(selectedMonth)
    const wk = parseInt(selectedWeek)
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    let startDate: string | undefined
    let endDate: string | undefined

    if (selectedPeriod === 'week') {
      const firstDay = new Date(y, m - 1, 1)
      const firstSunday = new Date(firstDay)
      firstSunday.setDate(firstDay.getDate() - firstDay.getDay())
      const start = new Date(firstSunday)
      start.setDate(firstSunday.getDate() + (wk - 1) * 7)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      startDate = fmt(start)
      endDate   = fmt(end)
    } else if (selectedPeriod === 'month') {
      startDate = fmt(new Date(y, m - 1, 1))
      endDate   = fmt(new Date(y, m, 0))
    } else {
      startDate = `${y}-01-01`
      endDate   = `${y}-12-31`
    }

    getTransactionSummary({
      period: selectedPeriod,
      year: y,
      month: selectedPeriod === 'year' ? undefined : m,
      startDate,
      endDate,
    })
      .then((data: any) => setTransactionStats({
        totalTransactions: data.totalTransactions ?? 0,
        pendingCount: data.pendingCount ?? 0,
      }))
      .catch(() => {})
  }, [selectedPeriod, selectedYear, selectedMonth, selectedWeek])

  if (!isAuthenticated && !isLoading) return null

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleExportReport = () => {
    showExportModal((format) => {
      exportAnalyticsReport({ period: selectedPeriod, year: selectedYear, month: selectedMonth, week: selectedWeek }, format)
    })
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':  return `${t(`weeks.${selectedWeek}` as any)} — ${selectedYear}`
      case 'month': return `${selectedMonth}/${selectedYear}`
      case 'year':  return `${t('thisYear')} ${selectedYear}`
      default:      return t('thisWeek')
    }
  }

  const getWeeksInMonth = () => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay  = new Date(year, month, 0)
    // Find Sunday on or before the 1st
    const firstSunday = new Date(firstDay)
    firstSunday.setDate(firstDay.getDate() - firstDay.getDay())
    const weeks: { value: string; label: string }[] = []
    let weekNum = 1
    const cursor = new Date(firstSunday)
    while (cursor <= lastDay) {
      const weekStart = new Date(cursor)
      const weekEnd   = new Date(cursor); weekEnd.setDate(cursor.getDate() + 6)
      if (weekEnd >= firstDay) {
        const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        weeks.push({ value: String(weekNum), label: `${fmt(weekStart)} - ${fmt(weekEnd)}` })
        weekNum++
      }
      cursor.setDate(cursor.getDate() + 7)
    }
    return weeks
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
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
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
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
          
          {/* Period Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('period')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getPeriodLabel()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year */}
              <select
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setSelectedPeriod('week') }}
                className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              {/* Month */}
              <select
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setSelectedPeriod('week') }}
                className="flex-1 min-w-[90px] px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {tReports(`months.${i + 1}` as any)}
                  </option>
                ))}
              </select>
              {/* Week with date range label */}
              <select
                value={selectedWeek}
                onChange={(e) => { setSelectedWeek(e.target.value); setSelectedPeriod('week') }}
                className="flex-1 min-w-[140px] px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                {getWeeksInMonth().map((week) => (
                  <option key={week.value} value={week.value}>{week.label}</option>
                ))}
              </select>
            </div>
            </div>

          {/* Summary Stats — 2x2 on mobile, 3-col on md+ */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('totalTransactions')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{transactionStats.totalTransactions}</p>
                </div>
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('pendingTransactions')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{transactionStats.pendingCount}</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('selectedPeriod')}</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedPeriod === 'week' ? t('weekly') :
                     selectedPeriod === 'month' ? t('monthly') : t('annual')}
                  </p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Reports Overview - Restored */}
          <div data-tour="analytics-main">
            <ReportsOverview 
              period={selectedPeriod}
              year={selectedYear}
              month={selectedMonth}
              week={selectedWeek}
            />

            {/* Weekly Closure Analysis - New */}
            <WeeklyClosureAnalysis 
              period={selectedPeriod}
              year={selectedYear}
              month={selectedMonth}
            />

            {/* Annual Performance - Only bars */}
            <AnnualPerformance 
              period={selectedPeriod}
              year={selectedYear}
              month={selectedMonth}
            />

            {/* Year Comparison - Only show when period is 'year' */}
            {selectedPeriod === 'year' && (
              <YearComparison 
                period={selectedPeriod}
                year={selectedYear}
                month={selectedMonth}
              />
            )}
          </div>
        </div>
      </PageLayout>

      {/* Onboarding Tour */}
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