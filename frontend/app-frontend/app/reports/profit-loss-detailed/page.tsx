'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import ProfitLossDetailedReport from '@/components/reports/ProfitLossDetailedReport'
import { exportReportData, showExportModal } from '@/services/exportService'

export default function ProfitLossDetailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const period = searchParams.get('period') || 'month'
  const year = searchParams.get('year') || '2024'
  const month = searchParams.get('month') || '01'

  const handleLogout = async () => {
    router.push('/auth/login')
  }

  const handleBack = () => {
    router.push('/reports')
  }

  const handleExport = () => {
    showExportModal((format) => {
      exportReportData('profit-loss-detailed', format)
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Informe de Pérdidas y Beneficios</h1>
                  <p className="text-sm text-gray-500 mt-1">Análisis detallado mensual de rendimiento financiero</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExport}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProfitLossDetailedReport 
            period={period}
            year={year}
            month={month}
          />
        </div>
      </div>
    </div>
  )
}