'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Calendar, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import {
  mockTransactions, 
  formatCurrency, 
  getTotalIncomeFiltered, 
  getTotalExpensesFiltered,
  getNetProfitFiltered,
  getDateRangeFromPeriod
} from '@/data/transactions-data'
import { exportReportData, showExportModal } from '@/services/exportService'

interface WeekData {
  weekNumber: number
  startDate: string
  endDate: string
  status: 'open' | 'closed' | 'pending'
  income: number
  expenses: number
  netProfit: number
  transactionCount: number
  pendingTransactions: number
}

export default function WeekClosePage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [selectedYear, setSelectedYear] = useState('2024')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('01')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null)
  const [actionType, setActionType] = useState<'close' | 'reopen'>('close')

  // Onboarding hook
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding()

  // RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }
  
  // Si no está autenticado, el hook ya redirigió al login
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const handleExportWeekClose = () => {
    showExportModal((format) => {
      exportReportData('week-close', format)
    })
  }

  // Generate weekly data for the selected month
  const generateWeeklyData = (): WeekData[] => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    const weeks: WeekData[] = []
    let weekNumber = 1
    let currentDate = new Date(firstDay)
    
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      // Don't go beyond the month
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime())
      }
      
      const startDateStr = weekStart.toISOString().split('T')[0]
      const endDateStr = weekEnd.toISOString().split('T')[0]
      
      // Calculate week metrics
      const weekIncome = getTotalIncomeFiltered(startDateStr, endDateStr)
      const weekExpenses = getTotalExpensesFiltered(startDateStr, endDateStr)
      const weekNetProfit = weekIncome - weekExpenses
      
      // Count transactions for this week
      const weekTransactions = mockTransactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= weekStart && transactionDate <= weekEnd
      })
      
      const pendingCount = weekTransactions.filter(t => t.status === 'pending').length
      
      // Determine status (simulate some closed weeks)
      let status: 'open' | 'closed' | 'pending' = 'open'
      if (weekEnd < new Date()) {
        status = weekNumber <= 2 ? 'closed' : pendingCount > 0 ? 'pending' : 'open'
      }
      
      weeks.push({
        weekNumber,
        startDate: startDateStr,
        endDate: endDateStr,
        status,
        income: weekIncome,
        expenses: weekExpenses,
        netProfit: weekNetProfit,
        transactionCount: weekTransactions.length,
        pendingTransactions: pendingCount
      })
      
      weekNumber++
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    return weeks
  }

  const weeklyData = generateWeeklyData()
  const totalIncome = weeklyData.reduce((sum, week) => sum + week.income, 0)
  const totalExpenses = weeklyData.reduce((sum, week) => sum + week.expenses, 0)
  const totalNetProfit = totalIncome - totalExpenses
  const closedWeeks = weeklyData.filter(w => w.status === 'closed').length
  const pendingWeeks = weeklyData.filter(w => w.status === 'pending').length

  const handleCloseWeek = (week: WeekData) => {
    setSelectedWeek(week)
    setActionType('close')
    setShowActionModal(true)
  }

  const handleReopenWeek = (week: WeekData) => {
    setSelectedWeek(week)
    setActionType('reopen')
    setShowActionModal(true)
  }

  const handleViewWeekDetails = (week: WeekData) => {
    setSelectedWeek(week)
    setShowDetailsModal(true)
  }

  const confirmAction = () => {
    if (!selectedWeek) return
    
    if (actionType === 'close') {
      // In a real app, this would make an API call
      alert(`Semana ${selectedWeek.weekNumber} cerrada exitosamente. Las transacciones han sido bloqueadas.`)
    } else {
      // In a real app, this would make an API call
      alert(`Semana ${selectedWeek.weekNumber} reabierta exitosamente. Las transacciones pueden ser editadas nuevamente.`)
    }
    
    setShowActionModal(false)
    setSelectedWeek(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'open':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return <Lock className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'open':
        return <Unlock className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'closed':
        return 'Cerrada'
      case 'pending':
        return 'Pendiente'
      case 'open':
        return 'Abierta'
      default:
        return 'Desconocido'
    }
  }

  const WeekRow = ({ week }: { week: WeekData }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(week.status)}`}>
            {getStatusIcon(week.status)}
          </div>
          <div>
            <p className="font-medium text-gray-900">Semana {week.weekNumber}</p>
            <p className="text-sm text-gray-500">
              {new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(week.status)}`}>
          {getStatusText(week.status)}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-sm font-medium text-gray-900">{week.transactionCount}</span>
        {week.pendingTransactions > 0 && (
          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            {week.pendingTransactions} pendientes
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-green-600 font-semibold">{formatCurrency(week.income)}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-red-600 font-semibold">{formatCurrency(week.expenses)}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className={`font-semibold ${week.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
          {formatCurrency(week.netProfit)}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleViewWeekDetails(week)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          {week.status === 'open' || week.status === 'pending' ? (
            <button
              onClick={() => handleCloseWeek(week)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
              title="Cerrar semana"
            >
              <Lock className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleReopenWeek(week)}
              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors duration-200"
              title="Reabrir semana"
            >
              <Unlock className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )

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
                  Cierre Semanal
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestión y control de cierres semanales
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExportWeekClose}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-tour="week-close-main">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600 truncate">Ingresos del Mes</p>
                  <p className="text-lg lg:text-2xl font-bold text-green-700 truncate" title={formatCurrency(totalIncome)}>
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                  <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600 truncate">Gastos del Mes</p>
                  <p className="text-lg lg:text-2xl font-bold text-red-700 truncate" title={formatCurrency(totalExpenses)}>
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`${totalNetProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-2 rounded-lg flex-shrink-0`}>
                  <DollarSign className={`w-4 h-4 lg:w-5 lg:h-5 ${totalNetProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600 truncate">Beneficio Neto</p>
                  <p className={`text-lg lg:text-2xl font-bold truncate ${totalNetProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`} title={formatCurrency(totalNetProfit)}>
                    {formatCurrency(totalNetProfit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600 truncate">Estado de Cierres</p>
                  <p className="text-base lg:text-lg font-bold text-purple-700 truncate">
                    {closedWeeks}/{weeklyData.length} Cerradas
                  </p>
                  {pendingWeeks > 0 && (
                    <p className="text-xs text-yellow-600 truncate">{pendingWeeks} pendientes</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Data Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Cierres Semanales - {getMonthName(selectedMonth)} {selectedYear}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona el cierre de cada semana para mantener la integridad de los datos
              </p>
            </div>

            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden lg:block overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semana
                    </th>
                    <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transacciones
                    </th>
                    <th className="w-[12%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="w-[12%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gastos
                    </th>
                    <th className="w-[12%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficio
                    </th>
                    <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weeklyData.map((week) => (
                    <WeekRow key={week.weekNumber} week={week} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cartas para pantallas pequeñas y medianas */}
            <div className="lg:hidden divide-y divide-gray-200">
              {weeklyData.map((week) => (
                <div key={week.weekNumber} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(week.status)}`}>
                        {getStatusIcon(week.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Semana {week.weekNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(week.status)}`}>
                      {getStatusText(week.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Transacciones</p>
                      <p className="text-sm font-medium text-gray-900">{week.transactionCount}</p>
                      {week.pendingTransactions > 0 && (
                        <p className="text-xs text-yellow-600">{week.pendingTransactions} pendientes</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Beneficio</p>
                      <p className={`text-sm font-semibold truncate ${week.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} title={formatCurrency(week.netProfit)}>
                        {formatCurrency(week.netProfit)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Ingresos</p>
                      <p className="text-sm font-semibold text-green-600 truncate" title={formatCurrency(week.income)}>
                        {formatCurrency(week.income)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Gastos</p>
                      <p className="text-sm font-semibold text-red-600 truncate" title={formatCurrency(week.expenses)}>
                        {formatCurrency(week.expenses)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleViewWeekDetails(week)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver detalles</span>
                    </button>
                    {week.status === 'open' || week.status === 'pending' ? (
                      <button
                        onClick={() => handleCloseWeek(week)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Cerrar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReopenWeek(week)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Reabrir</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {weeklyData.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de semanas</h3>
                <p className="text-gray-500">
                  Selecciona un mes diferente para ver los cierres semanales
                </p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">¿Qué es el Cierre Semanal?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  El cierre semanal es un proceso que bloquea las transacciones de una semana específica, 
                  evitando modificaciones accidentales y manteniendo la integridad de los registros financieros.
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Abierta:</strong> Las transacciones pueden ser editadas o eliminadas</li>
                  <li>• <strong>Pendiente:</strong> Hay transacciones pendientes que requieren atención</li>
                  <li>• <strong>Cerrada:</strong> Las transacciones están bloqueadas y no se pueden modificar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de Semana */}
      {showDetailsModal && selectedWeek && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-black bg-opacity-50 absolute inset-0" onClick={() => setShowDetailsModal(false)}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 relative">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Detalles de Semana {selectedWeek.weekNumber}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedWeek.startDate).toLocaleDateString('es-ES')} - {new Date(selectedWeek.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              {/* Resumen de la Semana */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1 rounded ${getStatusColor(selectedWeek.status)}`}>
                      {getStatusIcon(selectedWeek.status)}
                    </div>
                    <span className="text-xs lg:text-sm font-medium text-gray-600">Estado</span>
                  </div>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900">{getStatusText(selectedWeek.status)}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                    <span className="text-xs lg:text-sm font-medium text-gray-600">Ingresos</span>
                  </div>
                  <p className="text-sm lg:text-lg font-semibold text-green-700 truncate" title={formatCurrency(selectedWeek.income)}>
                    {formatCurrency(selectedWeek.income)}
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    <span className="text-xs lg:text-sm font-medium text-gray-600">Gastos</span>
                  </div>
                  <p className="text-sm lg:text-lg font-semibold text-red-700 truncate" title={formatCurrency(selectedWeek.expenses)}>
                    {formatCurrency(selectedWeek.expenses)}
                  </p>
                </div>

                <div className={`${selectedWeek.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-3 lg:p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className={`w-3 h-3 lg:w-4 lg:h-4 ${selectedWeek.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    <span className="text-xs lg:text-sm font-medium text-gray-600">Beneficio</span>
                  </div>
                  <p className={`text-sm lg:text-lg font-semibold truncate ${selectedWeek.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`} title={formatCurrency(selectedWeek.netProfit)}>
                    {formatCurrency(selectedWeek.netProfit)}
                  </p>
                </div>
              </div>

              {/* Transacciones de la Semana */}
              <div className="mb-6">
                <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                  Transacciones de la Semana ({selectedWeek.transactionCount})
                </h4>
                
                {selectedWeek.transactionCount > 0 ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    {/* Vista de tabla para pantallas grandes */}
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {mockTransactions
                            .filter(t => {
                              const transactionDate = new Date(t.date)
                              const weekStart = new Date(selectedWeek.startDate)
                              const weekEnd = new Date(selectedWeek.endDate)
                              return transactionDate >= weekStart && transactionDate <= weekEnd
                            })
                            .slice(0, 10)
                            .map((transaction, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(transaction.date).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.type === 'income' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium">
                                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(transaction.amount)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {transaction.status === 'completed' ? 'Completada' : 'Pendiente'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista de cartas para pantallas pequeñas */}
                    <div className="lg:hidden divide-y divide-gray-200">
                      {mockTransactions
                        .filter(t => {
                          const transactionDate = new Date(t.date)
                          const weekStart = new Date(selectedWeek.startDate)
                          const weekEnd = new Date(selectedWeek.endDate)
                          return transactionDate >= weekStart && transactionDate <= weekEnd
                        })
                        .slice(0, 10)
                        .map((transaction, index) => (
                          <div key={index} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(transaction.amount)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status === 'completed' ? 'Completada' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {selectedWeek.transactionCount > 10 && (
                      <div className="px-4 py-3 bg-gray-100 text-center text-sm text-gray-500">
                        Mostrando 10 de {selectedWeek.transactionCount} transacciones
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay transacciones en esta semana</p>
                  </div>
                )}
              </div>

              {/* Información Adicional */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-900 mb-1">Información del Cierre</h5>
                    <p className="text-sm text-blue-800">
                      {selectedWeek.status === 'closed' 
                        ? 'Esta semana está cerrada. Las transacciones no pueden ser modificadas.'
                        : selectedWeek.status === 'pending'
                        ? `Hay ${selectedWeek.pendingTransactions} transacciones pendientes que requieren atención antes del cierre.`
                        : 'Esta semana está abierta. Las transacciones pueden ser editadas libremente.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                Cerrar
              </button>
              {selectedWeek.status !== 'closed' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleCloseWeek(selectedWeek)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cerrar Semana</span>
                </button>
              )}
              {selectedWeek.status === 'closed' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleReopenWeek(selectedWeek)
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Reabrir Semana</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Acción */}
      {showActionModal && selectedWeek && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-black bg-opacity-50 absolute inset-0" onClick={() => setShowActionModal(false)}></div>
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200 relative">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  actionType === 'close' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {actionType === 'close' ? (
                    <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  ) : (
                    <Unlock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                    {actionType === 'close' ? 'Cerrar Semana' : 'Reabrir Semana'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    Semana {selectedWeek.weekNumber} ({new Date(selectedWeek.startDate).toLocaleDateString('es-ES')} - {new Date(selectedWeek.endDate).toLocaleDateString('es-ES')})
                  </p>
                </div>
              </div>

              <div className="mb-6">
                {actionType === 'close' ? (
                  <div>
                    <p className="text-gray-700 mb-4">
                      ¿Estás seguro de que deseas cerrar esta semana? Esta acción:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Bloqueará todas las transacciones de la semana</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Impedirá modificaciones accidentales</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Mantendrá la integridad de los registros</span>
                      </li>
                    </ul>
                    {selectedWeek.pendingTransactions > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Atención</p>
                            <p className="text-sm text-yellow-700">
                              Hay {selectedWeek.pendingTransactions} transacciones pendientes. 
                              Se recomienda completarlas antes del cierre.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">
                      ¿Estás seguro de que deseas reabrir esta semana? Esta acción:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex items-start space-x-2">
                        <Unlock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Permitirá editar las transacciones de la semana</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Unlock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Los datos podrán ser modificados nuevamente</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Se perderá la protección del cierre</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm ${
                    actionType === 'close' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {actionType === 'close' ? 'Cerrar Semana' : 'Reabrir Semana'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}

const getMonthName = (monthNum: string) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[parseInt(monthNum) - 1] || 'Mes'
}