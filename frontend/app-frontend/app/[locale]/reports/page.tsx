'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/hooks/useAuth'
import PageLayout from '@/components/ui/PageLayout'
import MobileMenuButton from '@/components/ui/MobileMenuButton'
import { FileText, TrendingUp, BarChart3, FileBarChart, Clock, Calendar } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTranslations } from 'next-intl'
import { getTransactionSummary } from '@/services/reportService'
import DateRangePicker from '@/components/ui/DateRangePicker'

interface ReportTemplate {
  id: string
  nameKey: string
  descKey: string
  icon: React.ComponentType<{ className?: string }>
}

const reportTemplates: ReportTemplate[] = [
  { id: 'profit-loss',         nameKey: 'financialSummary',   descKey: 'financialSummaryDesc',   icon: TrendingUp  },
  { id: 'transaction-summary', nameKey: 'transactionSummary', descKey: 'transactionSummaryDesc', icon: FileBarChart },
  { id: 'week-close',          nameKey: 'weekClose',          descKey: 'weekCloseDesc',          icon: Calendar    },
]

const SESSION_KEY = 'reports_date_state'

function getInitialDates(): { start: string | null; end: string | null } {
  // Always start fresh — no preselection on page load
  return { start: null, end: null }
}

export default function ReportsPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('reports')
  const {
    isOnboardingOpen, currentStep: onboardingStep,
    setStep: setOnboardingStep, closeOnboarding, completeOnboarding,
  } = useOnboarding()

  const initial = getInitialDates()
  const [startDate, setStartDate] = useState<string | null>(initial.start)
  const [endDate,   setEndDate]   = useState<string | null>(initial.end)
  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  // Persist date range in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ start: startDate, end: endDate }))
    } catch { /* ignore */ }
  }, [startDate, endDate])

  // Reactive transaction counter — only fetch when user has selected dates
  useEffect(() => {
    if (!startDate && !endDate) {
      setTotalTransactions(0)
      return
    }
    getTransactionSummary({
      startDate: startDate ?? undefined,
      endDate:   endDate   ?? undefined,
    })
      .then((d: any) => setTotalTransactions(d?.totalTransactions ?? 0))
      .catch(() => {})
  }, [startDate, endDate])

  if (!isAuthenticated && !isLoading) return null

  const handleGenerateReport = (reportId: string) => {
    const params = new URLSearchParams()
    // Always pass the exact date range the user selected
    if (startDate) params.set('startDate', startDate)
    if (endDate)   params.set('endDate',   endDate)
    // Pass period as 'custom' when user picked a range, otherwise default to month
    params.set('period', startDate && endDate ? 'custom' : 'month')
    // Pass year/month derived from startDate for sub-reports that need them
    const ref = startDate ? new Date(startDate + 'T00:00:00') : new Date()
    params.set('year',  String(ref.getFullYear()))
    params.set('month', String(ref.getMonth() + 1).padStart(2, '0'))

    switch (reportId) {
      case 'profit-loss':         router.push(`/reports/financial-summary?${params}`);    break
      case 'transaction-summary': router.push(`/reports/transaction-summary?${params}`);  break
      case 'week-close':          router.push(`/reports/week-close?${params}`);           break
    }
  }

  const getPeriodLabel = () => {
    if (startDate && endDate) {
      const fmt = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      return `${fmt(startDate)} – ${fmt(endDate)}`
    }
    if (startDate) return new Date(startDate + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    return '—'
  }

  const ReportCard = ({ report }: { report: ReportTemplate }) => {
    const Icon = report.icon
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-primary-100 p-2 rounded-lg shrink-0">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{t(report.nameKey as any)}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{t(report.descKey as any)}</p>
        <div className="mb-6">
          <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {startDate && endDate ? getPeriodLabel() : '—'}
          </span>
        </div>
        <button
          onClick={() => handleGenerateReport(report.id)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          <FileText className="w-4 h-4" />
          <span>{t('generate')}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar onLogout={logout} />

      <PageLayout>
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{t('title')}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">{t('subtitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('availableReports')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">3</p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('transactionsCount')}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTransactions}</p>
                </div>
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('selectedPeriod')}</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                    {startDate && endDate ? getPeriodLabel() : '—'}
                  </p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-tour="reports-grid">
            {reportTemplates.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
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
