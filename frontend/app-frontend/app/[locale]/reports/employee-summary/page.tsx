'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Download } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import PageLayout from '@/components/ui/PageLayout'
import EmployeeSummaryReport from '@/components/reports/EmployeeSummaryReport'
import { exportEmployeeSummary, showExportModal } from '@/services/exportService'
import { useTranslations } from 'next-intl'

export default function EmployeeSummaryPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('reports.rptEmployeeSummary')
  const tCommon = useTranslations('common')
  const tReports = useTranslations('reports')
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

  if (!isAuthenticated && !isLoading) return null

  const handleLogout = async () => {
    logout()
  }

  const handleExport = () => {
    showExportModal((format) => {
      exportEmployeeSummary(format)
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <PageLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('pageTitle')}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('pageSubtitle')}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleExport}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                {tCommon("export")}
              </button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">{t('analysisPeriod')}</h3>
              <div className="flex items-center space-x-2">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                      period === p
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p === 'week' ? tReports('weekly') : p === 'month' ? tReports('monthly') : tReports('annual')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <EmployeeSummaryReport period={period} />
        </div>
      </PageLayout>
    </div>
  )
}
