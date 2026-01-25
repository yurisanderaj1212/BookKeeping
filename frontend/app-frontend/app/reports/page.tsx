'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  FileText, 
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart,
  Clock,
  Search
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import { getTransactionStats } from '@/data/transactions-data'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
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
    category: 'financial',
    icon: TrendingUp,
    lastGenerated: '2024-01-20',
    frequency: 'monthly'
  },
  {
    id: 'profit-loss-detailed',
    name: 'Informe de Pérdidas y Beneficios',
    description: 'Análisis detallado mensual de pérdidas y beneficios',
    category: 'financial',
    icon: BarChart3,
    lastGenerated: '2024-01-18',
    frequency: 'monthly'
  },
  
  // Reportes de Transacciones
  {
    id: 'transaction-detail',
    name: 'Detalle de Transacciones',
    description: 'Lista completa de todas las transacciones registradas',
    category: 'transactions',
    icon: FileText,
    lastGenerated: '2024-01-22',
    frequency: 'weekly'
  },
  {
    id: 'transaction-summary',
    name: 'Resumen de Transacciones',
    description: 'Resumen agrupado por tipo y estado de transacciones',
    category: 'transactions',
    icon: FileBarChart,
    frequency: 'monthly'
  },
  
  // Reportes de Categorías
  {
    id: 'category-breakdown',
    name: 'Análisis por Categorías',
    description: 'Desglose detallado de ingresos y gastos por categoría',
    category: 'categories',
    icon: PieChart,
    lastGenerated: '2024-01-18',
    frequency: 'monthly'
  }
]

const categories = [
  { id: 'all', name: 'Todos los Reportes', icon: FileText },
  { id: 'financial', name: 'Resumen Financiero', icon: TrendingUp },
  { id: 'transactions', name: 'Transacciones', icon: FileBarChart },
  { id: 'categories', name: 'Categorías', icon: PieChart }
]

export default function ReportsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('01')

  const handleLogout = async () => {
    console.log('Logging out...')
    router.push('/auth/login')
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
      case 'transaction-detail':
        router.push(`/reports/transaction-detail?${params.toString()}`)
        break
      case 'transaction-summary':
        router.push(`/reports/transaction-summary?${params.toString()}`)
        break
      case 'category-breakdown':
        router.push(`/reports/category-breakdown?${params.toString()}`)
        break
      default:
        alert('Reporte no disponible')
    }
  }

  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = getTransactionStats()

  const ReportCard = ({ report }: { report: ReportTemplate }) => {
    const Icon = report.icon
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
        
        {/* Period Information */}
        <div className="mb-6">
          <span className="inline-flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {report.frequency === 'daily' ? 'Diario' :
             report.frequency === 'weekly' ? 'Semanal' :
             report.frequency === 'monthly' ? 'Mensual' :
             report.frequency === 'quarterly' ? 'Trimestral' : 'Anual'}
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
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
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
              <div className="flex items-center space-x-3">
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reportes Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{reportTemplates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                </div>
                <PieChart className="w-8 h-8 text-blue-600" />
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
                  <p className="text-sm text-gray-600">Período Actual</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPeriod === 'month' ? `${selectedMonth}/${selectedYear}` : selectedYear}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Categories */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    const isActive = selectedCategory === category.id
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span>{category.name}</span>
                        {category.id === 'all' && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {reportTemplates.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Period Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filtros de Período</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="month">Este mes</option>
                      <option value="quarter">Este trimestre</option>
                      <option value="year">Este año</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>
                  {selectedPeriod === 'month' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mes
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar reportes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reportes</h3>
                  <p className="text-gray-500">
                    Intenta cambiar los filtros o el término de búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}