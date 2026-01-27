'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, Landmark, FileText, Calendar } from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import StatsCards from '../../components/dashboard/StatsCards'
import WeeklyChart from '../../components/dashboard/WeeklyChart'
import MonthlyChart from '../../components/dashboard/MonthlyChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import CategoryBreakdown from '../../components/dashboard/CategoryBreakdown'
import EmployeeOverview from '../../components/dashboard/EmployeeOverview'
import NotificationButton from '../../components/notifications/NotificationButton'
import OnboardingTour from '../../components/onboarding/OnboardingTour'
import HelpButton from '../../components/onboarding/HelpButton'
import WelcomeModal from '../../components/onboarding/WelcomeModal'
import { useOnboarding } from '../../hooks/useOnboarding'
import {
  mockWeeklyData,
  mockMonthlyData,
  dashboardTransactions,
  mockCategoryData
} from '../../data/dashboard-data'
import { getDataWithChanges, getPeriodLabel } from '../../data/transactions-data'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Onboarding hook
  const {
    isOnboardingOpen,
    isOnboardingCompleted,
    isWelcomeOpen,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    closeWelcome,
    startTourFromWelcome
  } = useOnboarding()

  // Get data based on selected period with percentage changes
  const periodDataWithChanges = getDataWithChanges(selectedPeriod)
  const periodLabel = getPeriodLabel(selectedPeriod)

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

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
        // TODO: Implement bank connection
        console.log('Connecting bank...')
        break
      default:
        break
    }
  }

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const quickActions = [
    {
      id: 'add-transaction',
      title: 'Agregar Transacción',
      description: 'Registrar nuevo ingreso o gasto',
      icon: Plus
    },
    {
      id: 'generate-report',
      title: 'Generar Reporte',
      description: 'Crear estados financieros',
      icon: FileText
    },
    {
      id: 'view-analytics',
      title: 'Ver Análisis',
      description: 'Información financiera detallada',
      icon: BarChart3
    },
    {
      id: 'connect-bank',
      title: 'Conectar Banco',
      description: 'Vincular tu cuenta bancaria',
      icon: Landmark
    }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div data-tour="sidebar">
        <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Resumen
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  ¡Bienvenido de vuelta! Aquí está tu resumen financiero
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Period Selector */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                  >
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mes</option>
                    <option value="year">Este Año</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => router.push('/transactions')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                    data-tour="add-transaction-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Transacción</span>
                  </button>
                  
                  {/* Notification Button */}
                  <div data-tour="notification-btn">
                    <NotificationButton />
                  </div>

                  {/* Help Button */}
                  <HelpButton onStartTour={startOnboarding} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Quick Actions - Compact version right after header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6" data-tour="quick-actions">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                    <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-200 flex-shrink-0">
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

        {/* Stats Cards */}
        <div data-tour="stats-cards">
          <StatsCards
            totalIncome={periodDataWithChanges.totalIncome}
            totalExpenses={periodDataWithChanges.totalExpenses}
            netProfit={periodDataWithChanges.netProfit}
            pending={periodDataWithChanges.pendingCount}
            incomeChange={periodDataWithChanges.changes.incomeChange}
            expensesChange={periodDataWithChanges.changes.expensesChange}
            profitChange={periodDataWithChanges.changes.profitChange}
            pendingChange={periodDataWithChanges.changes.pendingChange}
            periodLabel={periodLabel}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeeklyChart data={mockWeeklyData} />
          <MonthlyChart data={mockMonthlyData} />
        </div>

        {/* Bottom Row - Same height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-[600px]">
            <RecentTransactions transactions={dashboardTransactions} />
          </div>
          <div className="h-[600px]">
            <CategoryBreakdown categories={mockCategoryData} />
          </div>
        </div>

        {/* Employee Overview */}
        <div className="mb-6">
          <EmployeeOverview period={selectedPeriod} />
        </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={closeWelcome}
        onStartTour={startTourFromWelcome}
        userName="Usuario"
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
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