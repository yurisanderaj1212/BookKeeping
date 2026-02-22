'use client'

import { useState } from 'react'
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
import { getTransactionStats, getCurrentWeekDates, getCurrentMonthDates, getCurrentYearDates } from '@/data/transactions-data'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  lastGenerated?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

const reportTemplates: ReportTemplate[] = [
  // Reportes Financieros Básicos
  {
    id: 'profit-loss',
    name: 'Estado de Resultados',
    description: 'Ingresos, gastos y beneficio neto del período',
    icon: TrendingUp,
    lastGenerated: '2024-01-20',
    frequency: 'monthly'
  },
  {
    id: 'profit-loss-detailed',
    name: 'Informe de Pérdidas y Beneficios',
    description: 'Análisis detallado mensual de pérdidas y beneficios',
    icon: BarChart3,
    lastGenerated: '2024-01-18',
    frequency: 'monthly'
  },
  
  // Reportes de Transacciones
  {
    id: 'transaction-summary',
    name: 'Resumen de Transacciones',
    description: 'Resumen agrupado por tipo y estado de transacciones',
    icon: FileBarChart,
    lastGenerated: '2024-01-19',
    frequency: 'weekly'
  },
  {
    id: 'category-breakdown',
    name: 'Desglose por Categorías',
    description: 'Análisis de gastos e ingresos por categoría',
    icon: PieChart,
    lastGenerated: '2024-01-17',
    frequency: 'monthly'
  },

  // Reportes de Empleados
  {
    id: 'employee-summary',
    name: 'Resumen de Empleados',
    description: 'Análisis de nómina, costos de personal y distribución por posiciones',
    icon: FileText,
    lastGenerated: '2024-01-21',
    frequency: 'monthly'
  },

  // Cierre Semanal
  {
    id: 'week-close',
    name: 'Cierre Semanal',
    description: 'Gestión y control de cierres semanales para mantener la integridad de datos',
    icon: Calendar,
    lastGenerated: '2024-01-22',
    frequency: 'weekly'
  }
]

export default function ReportsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Onboarding hook
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding()
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('01')

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
        alert('Reporte no disponible')
    }
  }

  const stats = getTransactionStats()

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        const weekDates = getCurrentWeekDates()
        return `Semana del 15-21 enero 2024`
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

  const ReportCard = ({ report }: { report: ReportTemplate }) => {
    const Icon = report.icon
    
    // Get frequency based on selected period
    const getFrequencyText = () => {
      switch (selectedPeriod) {
        case 'week':
          return 'Semanal'
        case 'month':
          return 'Mensual'
        case 'year':
          return 'Anual'
        default:
          return 'Mensual'
      }
    }
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        {/* Header with Icon and Name */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{report.name}</h3>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {report.description}
        </p>
        
        {/* Period Information - Synchronized with selected period */}
        <div className="mb-6">
          <span className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {getFrequencyText()}
          </span>
        </div>
        
        {/* Generate Button */}
        <button
          onClick={() => handleGenerateReport(report.id)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          <FileText className="w-4 h-4" />
          <span>Generar Reporte</span>
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
                  Centro de Reportes
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Genera informes financieros y análisis detallados
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
                  <h3 className="font-medium text-gray-900">Período de Reporte</h3>
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

                {/* Month Selector - Only show when month is selected */}
                {selectedPeriod === 'month' && (
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
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reportes Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transacciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
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
      />
    </div>
  )
}