'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import PageLayout from '@/components/ui/PageLayout'
import ProfitLossDetailedReport from '@/components/reports/ProfitLossDetailedReport'
import { exportProfitLoss, showExportModal } from '@/services/exportService'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'

function ProfitLossDetailedContent() {
  const { logout, isLoading } = useAuth()
  const t = useTranslations('common')
  const tReport = useTranslations('reports')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const period = searchParams.get('period') || 'month'
  const year = searchParams.get('year') || String(new Date().getFullYear())
  const month = searchParams.get('month') || String(new Date().getMonth() + 1).padStart(2, '0')

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    logout()
  }

  const handleBack = () => {
    router.push('/reports')
  }

  const handleExport = () => {
    showExportModal((format) => {
      exportProfitLoss({ year: parseInt(year), month: parseInt(month) }, format)
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar onLogout={handleLogout} />
      
      <PageLayout>
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tReport('profitLoss')}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tReport('profitLossDesc')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExport}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  {t("export")}
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
      </PageLayout>
    </div>
  )
}

export default function ProfitLossDetailedPage() {
  return <Suspense><ProfitLossDetailedContent /></Suspense>
}
