'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Download } from 'lucide-react'
import Sidebar from '../../../components/dashboard/Sidebar'
import EmployeeSummaryReport from '../../../components/reports/EmployeeSummaryReport'

export default function EmployeeSummaryPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting employee summary...')
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Resumen de Empleados
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Análisis detallado de nómina y empleados
                  </p>
                </div>
              </div>
              <button 
                onClick={handleExport}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Período de Análisis</h3>
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
                    {p === 'week' ? 'Semanal' : p === 'month' ? 'Mensual' : 'Anual'}
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
      </div>
    </div>
  )
}