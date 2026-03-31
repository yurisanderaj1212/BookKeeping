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
import EmployeeAnalysis from '@/components/analytics/EmployeeAnalysis'
import { getTransactionSummary } from '@/services/reportService'
import { exportAnalyticsReport, showExportModal } from '@/services/exportService'

export default function ReportsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('analytics')
  const tReports = useTranslations('reports')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [selectedMonth, setSelectedMonth] = useState('01')
  const [selectedWeek, setSelectedWeek] = useState('1')
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()

  const [transactionStats, setTransactionStats] = useState({ totalTransactions: 0, pendingCount: 0 })

  useEffect(() => {
    getTransactionSummary({ period: selectedPeriod })
      .then((data: any) => setTransactionStats({
        totalTransactions: data.totalTransactions ?? 0,
        pendingCount: data.pendingCount ?? 0
      }))
      .catch(() => {})
  }, [selectedPeriod])

  if (!isAuthenticated && !isLoading) return null

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleExportReport = () => {
    showExportModal((format) => {
      exportAnalyticsReport({ period: selectedPeriod, year: selectedYear, month: selectedMonth }, format)
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
    const daysInMonth = new Date(year, month, 0).getDate()
    const weeks = Math.ceil(daysInMonth / 7)
    return Array.from({ length: weeks }, (_, i) => ({
      value: (i + 1).toString(),
      label: t(`weeks.${i + 1}` as any),
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <PageLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">{t('subtitle')}</p>
              </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={handleExportReport}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
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
          
          {/* Period Filter Bar - Same as Reports */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{t('period')}</h3>
                  <p className="text-sm text-gray-500">{getPeriodLabel()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Period Type Selector */}
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                >
                  <option value="week">{t('thisWeek')}</option>
                  <option value="month">{t('thisMonth')}</option>
                  <option value="year">{t('thisYear')}</option>
                </select>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                >
                  {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>

                {(selectedPeriod === 'month' || selectedPeriod === 'week') && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {tReports(`months.${i + 1}` as any)}
                      </option>
                    ))}
                  </select>
                )}

                {/* Week Selector - Only show when week is selected */}
                {selectedPeriod === 'week' && (
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                  >
                    {getWeeksInMonth().map((week) => (
                      <option key={week.value} value={week.value}>
                        {week.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('totalTransactions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{transactionStats.totalTransactions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('pendingTransactions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{transactionStats.pendingCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('selectedPeriod')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPeriod === 'week' ? t('weekly') :
                     selectedPeriod === 'month' ? t('monthly') : t('annual')}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Reports Overview - Restored */}
          <div data-tour="analytics-main">
            <ReportsOverview 
              period={selectedPeriod}
              year={selectedYear}
              month={selectedMonth}
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

            {/* Employee Analysis */}
            <EmployeeAnalysis 
              period={selectedPeriod}
            />
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