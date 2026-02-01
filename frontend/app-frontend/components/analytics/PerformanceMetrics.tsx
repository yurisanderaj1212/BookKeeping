'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { mockTransactions, formatCurrency, getTotalIncome, getTotalExpenses } from '@/data/transactions-data'

interface PerformanceMetricsProps {
  period: string
  year: string
  month: string
}

export default function PerformanceMetrics({ period }: PerformanceMetricsProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 })
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('performance-chart-container')
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: 320
        })
      }
    }

    // Actualizar dimensiones inmediatamente y después de un pequeño delay
    updateDimensions()
    const timer = setTimeout(updateDimensions, 100)

    // Actualizar en resize
    window.addEventListener('resize', updateDimensions)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Calculate KPIs
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  
  const completedTransactions = mockTransactions.filter(t => t.status === 'completed').length
  const pendingTransactions = mockTransactions.filter(t => t.status === 'pending').length
  const completionRate = mockTransactions.length > 0 ? (completedTransactions / mockTransactions.length) * 100 : 0
  
  const avgTransactionValue = mockTransactions.length > 0 ? 
    mockTransactions.reduce((sum, t) => sum + t.amount, 0) / mockTransactions.length : 0
  
  const avgIncomeTransaction = mockTransactions.filter(t => t.type === 'income').length > 0 ?
    mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / 
    mockTransactions.filter(t => t.type === 'income').length : 0
    
  const avgExpenseTransaction = mockTransactions.filter(t => t.type === 'expense').length > 0 ?
    mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 
    mockTransactions.filter(t => t.type === 'expense').length : 0

  // Performance metrics data
  const performanceData = [
    {
      metric: 'Margen de Beneficio',
      value: profitMargin,
      target: 25,
      unit: '%',
      status: profitMargin >= 25 ? 'excellent' : profitMargin >= 15 ? 'good' : profitMargin >= 5 ? 'warning' : 'poor'
    },
    {
      metric: 'Tasa de Completación',
      value: completionRate,
      target: 95,
      unit: '%',
      status: completionRate >= 95 ? 'excellent' : completionRate >= 85 ? 'good' : completionRate >= 70 ? 'warning' : 'poor'
    },
    {
      metric: 'Eficiencia de Costos',
      value: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      target: 80,
      unit: '%',
      status: totalIncome > 0 && ((totalIncome - totalExpenses) / totalIncome) * 100 >= 80 ? 'excellent' : 
              totalIncome > 0 && ((totalIncome - totalExpenses) / totalIncome) * 100 >= 60 ? 'good' : 'warning'
    },
    {
      metric: 'ROI Promedio',
      value: totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0,
      target: 150,
      unit: '%',
      status: totalExpenses > 0 && (netProfit / totalExpenses) * 100 >= 150 ? 'excellent' : 
              totalExpenses > 0 && (netProfit / totalExpenses) * 100 >= 100 ? 'good' : 'warning'
    }
  ]

  // Transaction metrics for chart
  const transactionMetrics = [
    {
      name: 'Valor Promedio',
      ingresos: avgIncomeTransaction,
      gastos: avgExpenseTransaction,
      general: avgTransactionValue
    },
    {
      name: 'Valor Máximo',
      ingresos: Math.max(...mockTransactions.filter(t => t.type === 'income').map(t => t.amount), 0),
      gastos: Math.max(...mockTransactions.filter(t => t.type === 'expense').map(t => t.amount), 0),
      general: Math.max(...mockTransactions.map(t => t.amount), 0)
    },
    {
      name: 'Valor Mínimo',
      ingresos: Math.min(...mockTransactions.filter(t => t.type === 'income').map(t => t.amount), 0),
      gastos: Math.min(...mockTransactions.filter(t => t.type === 'expense').map(t => t.amount), 0),
      general: Math.min(...mockTransactions.map(t => t.amount), 0)
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100'
      case 'good':
        return 'text-blue-600 bg-blue-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'poor':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4" />
      case 'good':
        return <TrendingUp className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'poor':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? 'Ingresos' : 
               entry.dataKey === 'gastos' ? 'Gastos' : 'General'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Métricas de Rendimiento</h3>
            <p className="text-sm text-gray-500 mt-1">
              Indicadores clave de rendimiento (KPIs) del negocio
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Target className="w-4 h-4" />
            <span>Objetivos vs Resultados</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceData.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">{metric.metric}</h4>
                <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Actual</span>
                  <span className="text-lg font-bold text-gray-900">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Objetivo</span>
                  <span className="text-sm text-gray-600">
                    {metric.target}{metric.unit}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">0{metric.unit}</span>
                  <span className="text-gray-500">{metric.target}{metric.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Metrics Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Análisis de Transacciones</h4>
          
          <div id="performance-chart-container" className="w-full" style={{ height: 320 }}>
            {dimensions.width > 0 ? (
              <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
                <BarChart data={transactionMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h4>
          
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Puntuación General</span>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-lg font-bold text-blue-700">
                    {((performanceData.reduce((sum, m) => sum + (m.value / m.target), 0) / performanceData.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((performanceData.reduce((sum, m) => sum + (m.value / m.target), 0) / performanceData.length) * 100), 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">Insights Clave</h5>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Beneficio Positivo</p>
                    <p className="text-xs text-green-600">
                      Generando {formatCurrency(netProfit)} de beneficio neto
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Transacciones Activas</p>
                    <p className="text-xs text-blue-600">
                      {mockTransactions.length} transacciones procesadas
                    </p>
                  </div>
                </div>

                {pendingTransactions > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Transacciones Pendientes</p>
                      <p className="text-xs text-yellow-600">
                        {pendingTransactions} transacciones requieren atención
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}