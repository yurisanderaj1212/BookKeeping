'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import ReportsOverview from '@/components/analytics/ReportsOverview'
import PeriodComparison from '@/components/analytics/PeriodComparison'
import CategoryAnalysis from '@/components/analytics/CategoryAnalysis'
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics'
import AnnualPerformance from '@/components/analytics/AnnualPerformance'
import YearComparison from '@/components/analytics/YearComparison'
import { getTransactionStats } from '@/data/transactions-data'
import { exportAnalyticsData, showExportModal } from '@/services/exportService'

export default function ReportsPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('01')

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const handleExportReport = () => {
    showExportModal((format) => {
      exportAnalyticsData(format)
    })
  }

  const stats = getTransactionStats()

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Period Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                >
                  <option value="month">Este mes</option>
                  <option value="quarter">Este trimestre</option>
                  <option value="year">Este año</option>
                  <option value="custom">Período personalizado</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
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

              {/* Month Filter (if period is month) */}
              {selectedPeriod === 'month' && (
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
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Mostrando reportes para {selectedPeriod === 'month' ? 'el mes seleccionado' : selectedPeriod === 'year' ? 'el año seleccionado' : 'el período seleccionado'}
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  {stats.totalTransactions} Transacciones
                </span>
                <span className="flex items-center">
                  <BarChart3 className="w-3 h-3 text-blue-600 mr-1" />
                  {stats.pendingCount} Pendientes
                </span>
              </div>
            </div>
          </div>

          {/* Reports Overview */}
          <ReportsOverview 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Performance Metrics */}
          <PerformanceMetrics 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Annual Performance */}
          <AnnualPerformance 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Year Comparison */}
          <YearComparison 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Period Comparison */}
          <PeriodComparison 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* Category Analysis */}
          <CategoryAnalysis 
            period={selectedPeriod}
            year={selectedYear}
            month={selectedMonth}
          />
        </div>
      </div>
    </div>
  )
}