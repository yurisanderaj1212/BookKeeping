'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import ReportsOverview from '@/components/analytics/ReportsOverview'
import CategoryAnalysis from '@/components/analytics/CategoryAnalysis'
import AnnualPerformance from '@/components/analytics/AnnualPerformance'
import WeeklyClosureAnalysis from '@/components/analytics/WeeklyClosureAnalysis'
import YearComparison from '@/components/analytics/YearComparison'
import EmployeeAnalysis from '@/components/analytics/EmployeeAnalysis'
import { getTransactionStats, getCurrentWeekDates, getCurrentMonthDates, getCurrentYearDates } from '@/data/transactions-data'
import { exportAnalyticsData, showExportModal } from '@/services/exportService'

export default function ReportsPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('01')
  const [selectedWeek, setSelectedWeek] = useState('1')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Onboarding hook
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding()

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const handleExportReport = () => {
    showExportModal((format) => {
      exportAnalyticsData(format)
    })
  }

  const stats = getTransactionStats()

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return `Semana ${selectedWeek} de ${getMonthName(selectedMonth)} ${selectedYear}`
      case 'month':
        return `${getMonthName(selectedMonth)} ${selectedYear}`
      case 'year':
        return `Año ${selectedYear}`
      default:
        return 'Período actual'
    }
  }

  const getMonthName = (month: string) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[parseInt(month) - 1]
  }

  // Generate weeks for selected month
  const getWeeksInMonth = () => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    const daysInMonth = new Date(year, month, 0).getDate()
    const weeks = Math.ceil(daysInMonth / 7)
    
    return Array.from({ length: weeks }, (_, i) => ({
      value: (i + 1).toString(),
      label: `Semana ${i + 1}`
    }))
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
                  Análisis
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Análisis financiero y visualizaciones avanzadas
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExportReport}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Análisis</span>
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
                  <h3 className="font-medium text-gray-900">Período de Análisis</h3>
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
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mes</option>
                  <option value="year">Este Año</option>
                </select>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>

                {/* Month Selector - Show when month or week is selected */}
                {(selectedPeriod === 'month' || selectedPeriod === 'week') && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                  >
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
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
                  <p className="text-sm text-gray-600">Transacciones Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transacciones Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Período Seleccionado</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPeriod === 'week' ? 'Semanal' : 
                     selectedPeriod === 'month' ? 'Mensual' : 'Anual'}
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

            {/* Category Analysis */}
            <CategoryAnalysis 
              period={selectedPeriod}
              year={selectedYear}
              month={selectedMonth}
            />

            {/* Employee Analysis */}
            <EmployeeAnalysis 
              period={selectedPeriod}
            />
          </div>
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}