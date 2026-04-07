'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, Landmark, FileText } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import MonthlyChart from '@/components/dashboard/MonthlyChart'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown'
import NotificationButton from '@/components/notifications/NotificationButton'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import HelpButton from '@/components/onboarding/HelpButton'
import WelcomeModal from '@/components/onboarding/WelcomeModal'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import PageLayout from '@/components/ui/PageLayout'
import MobileMenuButton from '@/components/ui/MobileMenuButton'
import TrialBanner from '@/components/subscription/TrialBanner'
import * as dashboardService from '@/services/dashboardService'

/** Construye el label del período en el idioma del usuario */
function buildPeriodLabel(
  periodType: string,
  periodStart: string,
  periodEnd: string,
  locale: string
): string {
  const loc   = locale === 'en' ? 'en-US' : 'es-ES'
  const start = new Date(periodStart + 'T00:00:00')
  const end   = new Date(periodEnd   + 'T00:00:00')

  switch (periodType) {
    case 'week': {
      const month = start.toLocaleDateString(loc, { month: 'long' })
      const day1  = start.getDate()
      const day2  = end.getDate()
      const year  = start.getFullYear()
      return `${month} ${day1}-${day2}, ${year}`
    }
    case 'month':
      return new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(start)
    case 'year':
      return locale === 'en' ? `Year ${start.getFullYear()}` : `Año ${start.getFullYear()}`
    default: {
      const fmt = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric' })
      return `${fmt.format(start)} – ${fmt.format(end)}`
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS DEBEN IR AL INICIO - ANTES DE CUALQUIER RETURN CONDICIONAL
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const selectedPeriod = 'week' as const
  
  // Estados para datos del dashboard
  const [dashboardSummary, setDashboardSummary] = useState<dashboardService.DashboardSummary | null>(null)
  const [weeklyChartData, setWeeklyChartData] = useState<dashboardService.ChartDataPoint[]>([])
  const [monthlyChartData, setMonthlyChartData] = useState<dashboardService.ChartDataPoint[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<dashboardService.CategoryBreakdown[]>([])
  
  // Estados de loading
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  // Estado de error
  const [error, setError] = useState<string | null>(null)
  
  // Suscripción — banner de trial y redirección si expiró
  const { info: subInfo } = useSubscription()

  // Onboarding hook - DEBE IR AQUÍ, NO DESPUÉS DE LOS RETURNS
  const {
    isOnboardingOpen,
    isOnboardingCompleted,
    isWelcomeOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeWelcome,
    startTourFromWelcome,
  } = useOnboarding()

  // Cargar resumen del dashboard cuando cambia el período
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardSummary()
    }
  }, [isAuthenticated, selectedPeriod])

  // Cargar datos de gráficos una sola vez
  useEffect(() => {
    if (isAuthenticated) {
      loadChartData()
    }
  }, [isAuthenticated])

  // Cargar desglose por categorías cuando cambia el período
  useEffect(() => {
    if (isAuthenticated) {
      loadCategoryBreakdown()
    }
  }, [isAuthenticated, selectedPeriod])

  // Función para cargar el resumen del dashboard
  const loadDashboardSummary = async () => {
    try {
      setLoadingSummary(true)
      setError(null)
      
      const summary = await dashboardService.getSummary({ period: selectedPeriod })
      setDashboardSummary(summary)
    } catch (err: any) {
      setError(err.message || t('statsError'))
    } finally {
      setLoadingSummary(false)
    }
  }

  // Función para cargar datos de gráficos
  const loadChartData = async () => {
    try {
      setLoadingCharts(true)
      
      const [weekly, monthly] = await Promise.all([
        dashboardService.getWeeklyChartData(),
        dashboardService.getMonthlyChartData()
      ])
      
      setWeeklyChartData(weekly)
      setMonthlyChartData(monthly)
    } catch {
      // silencioso — no crítico
    } finally {
      setLoadingCharts(false)
    }
  }

  // Función para cargar desglose por categorías
  const loadCategoryBreakdown = async () => {
    try {
      setLoadingCategories(true)

      const [incomeBreakdown, expenseBreakdown] = await Promise.all([
        dashboardService.getCategoryBreakdown({ period: 'year' }, 10, 1),
        dashboardService.getCategoryBreakdown({ period: 'year' }, 10, 2),
      ])

      setCategoryBreakdown([...incomeBreakdown, ...expenseBreakdown])
    } catch {
      // silencioso — no crítico
    } finally {
      setLoadingCategories(false)
    }
  }
  
  if (!isAuthenticated && !isLoading) return null

  // FUNCIONES DEL COMPONENTE
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-transaction':
        router.push('/transactions')
        break
      case 'generate-report':
        router.push('/reports')
        break
      case 'view-analytics':
        router.push('/analytics')
        break
      case 'connect-bank':
        router.push('/accounts')
        break
      default:
        break
    }
  }

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const quickActions = [
    { id: 'add-transaction',  title: t('addTransaction'),  description: t('addTransactionDesc'),  icon: Plus },
    { id: 'generate-report',  title: t('generateReport'),  description: t('generateReportDesc'),  icon: FileText },
    { id: 'view-analytics',   title: t('viewAnalytics'),   description: t('viewAnalyticsDesc'),   icon: BarChart3 },
    { id: 'connect-bank',     title: t('connectBank'),     description: t('connectBankDesc'),     icon: Landmark },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <PageLayout>
        {/* Trial Banner */}
        {subInfo && <TrialBanner info={subInfo} />}

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">{t('welcome')}</p>
              </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div data-tour="notification-btn"><NotificationButton /></div>
                <HelpButton onStartTour={resetOnboarding} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Quick Actions - Compact version right after header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6" data-tour="quick-actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="bg-white border border-primary-200 hover:border-primary-300 hover:bg-primary-50 p-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md group"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInScale 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-200 shrink-0">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-gray-900 truncate">{action.title}</h4>
                      <p className="text-xs text-gray-500 truncate leading-tight">{action.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div data-tour="stats-cards">
          {loadingSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-32 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : dashboardSummary ? (
            <StatsCards
              totalIncome={dashboardSummary.totalIncome}
              totalExpenses={dashboardSummary.totalExpenses}
              netProfit={dashboardSummary.netProfit}
              pending={dashboardSummary.pendingCount}
              incomeChange={dashboardSummary.incomeChange}
              expensesChange={dashboardSummary.expensesChange}
              profitChange={dashboardSummary.profitChange}
              pendingChange={dashboardSummary.pendingChange}
              periodLabel={
                dashboardSummary.periodStart && dashboardSummary.periodEnd && dashboardSummary.periodType
                  ? buildPeriodLabel(dashboardSummary.periodType, dashboardSummary.periodStart, dashboardSummary.periodEnd, locale)
                  : dashboardSummary.periodLabel
              }
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">{t('statsError')}</p>
            </div>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="min-w-0">
            {loadingCharts ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : weeklyChartData.length > 0 ? (
              <WeeklyChart data={weeklyChartData} />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center h-64 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">{t('weeklyChart.title')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('recentTransactions.emptyDesc')}</p>
              </div>
            )}
          </div>
          <div className="min-w-0">
            {loadingCharts ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : monthlyChartData.length > 0 ? (
              <MonthlyChart data={monthlyChartData.map(d => ({
                month: d.label,
                income: d.income,
                expenses: d.expenses
              }))} />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center h-64 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">{t('monthlyChart.title')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('recentTransactions.emptyDesc')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown — full width */}
        <div className="mb-6 min-w-0">
            {loadingCategories ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse h-[400px]">
                <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CategoryBreakdown
                categories={categoryBreakdown.map(cat => ({
                  name: cat.categoryName,
                  amount: cat.amount,
                  percentage: cat.percentage,
                  color: '',
                  type: cat.type,
                }))}
              />
            )}
          </div>
        </div>
      </PageLayout>

      {/* Welcome Modal — solo para usuarios nuevos */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={closeWelcome}
        onStartTour={startTourFromWelcome}
        userName={user?.firstName}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        currentStep={onboardingStep}
        setStep={setOnboardingStep}
      />

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}