'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Calendar, 
  FileText, 
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart,
  Clock
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTranslations } from 'next-intl'
import { getTransactionSummary } from '@/services/reportService'

interface ReportTemplate {
  id: string
  nameKey: string
  descKey: string
  icon: React.ComponentType<{ className?: string }>
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

const reportTemplates: ReportTemplate[] = [
  { id: 'profit-loss',         nameKey: 'financialSummary',    descKey: 'financialSummaryDesc',    icon: TrendingUp,  frequency: 'monthly' },
  { id: 'profit-loss-detailed',nameKey: 'profitLoss',          descKey: 'profitLossDesc',          icon: BarChart3,   frequency: 'monthly' },
  { id: 'transaction-summary', nameKey: 'transactionSummary',  descKey: 'transactionSummaryDesc',  icon: FileBarChart,frequency: 'weekly'  },
  { id: 'category-breakdown',  nameKey: 'categoryBreakdown',   descKey: 'categoryBreakdownDesc',   icon: PieChart,    frequency: 'monthly' },
  { id: 'employee-summary',    nameKey: 'employeeSummary',     descKey: 'employeeSummaryDesc',     icon: FileText,    frequency: 'monthly' },
  { id: 'week-close',          nameKey: 'weekClose',           descKey: 'weekCloseDesc',           icon: Calendar,    frequency: 'weekly'  },
]

export default function ReportsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('reports')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Onboarding hook
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [totalTransactions, setTotalTransactions] = useState<number>(0)

  useEffect(() => {
    getTransactionSummary({ period: 'month' })
      .then((d: any) => setTotalTransactions(d?.totalTransactions ?? 0))
      .catch(() => {})
  }, [])

  if (!isAuthenticated && !isLoading) return null

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const handleGenerateReport = (reportId: string) => {
    // Construir URL con parámetros de filtro
    const params = new URLSearchParams({
      period: selectedPeriod,
      year: selectedYear,
      month: selectedMonth
    })
    
    // Redirigir solo a reportes que realmente tenemos implementados
    switch (reportId) {
      case 'profit-loss':
        router.push(`/reports/financial-summary?${params.toString()}`)
        break
      case 'profit-loss-detailed':
        router.push(`/reports/profit-loss-detailed?${params.toString()}`)
        break
      case 'transaction-summary':
        router.push(`/reports/transaction-summary?${params.toString()}`)
        break
      case 'category-breakdown':
        router.push(`/reports/category-breakdown?${params.toString()}`)
        break
      case 'employee-summary':
        router.push(`/reports/employee-summary?${params.toString()}`)
        break
      case 'week-close':
        router.push(`/reports/week-close?${params.toString()}`)
        break
      default:
        console.warn('Reporte no disponible:', reportId)
    }
  }


  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':  return t('thisWeek')
      case 'month': return `${t(`months.${parseInt(selectedMonth)}` as any)} ${selectedYear}`
      case 'year':  return `${t('year')} ${selectedYear}`
      default:      return t('thisWeek')
    }
  }

  const getFrequencyText = () => {
    switch (selectedPeriod) {
      case 'week':  return t('weekly')
      case 'month': return t('monthly')
      case 'year':  return t('annual')
      default:      return t('monthly')
    }
  }

  const ReportCard = ({ report }: { report: ReportTemplate }) => {
    const Icon = report.icon
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-primary-100 p-2 rounded-lg shrink-0">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{t(report.nameKey as any)}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{t(report.descKey as any)}</p>
        <div className="mb-6">
          <span className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {getFrequencyText()}
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Period Filter Bar */}
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
                  {Array.from({ length: 4 }, (_, i) => {
                    const y = new Date().getFullYear() - i
                    return <option key={y} value={String(y)}>{y}</option>
                  })}
                </select>

                {/* Month Selector - Only show when month is selected */}
                {selectedPeriod === 'month' && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {t(`months.${i + 1}` as any)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('availableReports')}</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('transactionsCount')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
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

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-tour="reports-grid">
            {reportTemplates.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>

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