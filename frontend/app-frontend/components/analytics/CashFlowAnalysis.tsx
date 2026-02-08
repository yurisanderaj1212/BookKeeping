'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { mockTransactions, formatCurrency } from '@/data/transactions-data'

interface CashFlowAnalysisProps {
  period: string
  year: string
  month: string
}

export default function CashFlowAnalysis({ period }: CashFlowAnalysisProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 })
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('weekly')
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('cashflow-chart-container')
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

  // Generate cash flow data
  const generateCashFlowData = () => {
    if (viewType === 'weekly') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
      return weeks.map((week, index) => {
        // Simulate weekly distribution
        const weekTransactions = mockTransactions.filter((_, i) => Math.floor(i / 6) === index)
        const ingresos = weekTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const gastos = weekTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        const flujoNeto = ingresos - gastos
        const acumulado = index === 0 ? flujoNeto : flujoNeto + (index * 2000) // Simulate accumulation
        
        return { 
          name: week, 
          ingresos, 
          gastos, 
          flujoNeto,
          acumulado
        }
      })
    } else {
      // Daily view - last 7 days
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      return days.map((day, index) => {
        // Simulate daily distribution
        const dailyTransactions = mockTransactions.filter((_, i) => i % 7 === index)
        const ingresos = dailyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const gastos = dailyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        const flujoNeto = ingresos - gastos
        
        return { 
          name: day, 
          ingresos, 
          gastos, 
          flujoNeto,
          acumulado: flujoNeto + (index * 500) // Simulate daily accumulation
        }
      })
    }
  }

  const cashFlowData = generateCashFlowData()
  const totalInflow = cashFlowData.reduce((sum, item) => sum + item.ingresos, 0)
  const totalOutflow = cashFlowData.reduce((sum, item) => sum + item.gastos, 0)
  const netCashFlow = totalInflow - totalOutflow
  const finalBalance = cashFlowData[cashFlowData.length - 1]?.acumulado || 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? 'Entradas' : 
               entry.dataKey === 'gastos' ? 'Salidas' : 
               entry.dataKey === 'flujoNeto' ? 'Flujo Neto' : 'Acumulado'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Cash flow summary table data
  const summaryData = [
    {
      concepto: 'Entradas de Efectivo',
      monto: totalInflow,
      porcentaje: 100,
      tipo: 'income' as const
    },
    {
      concepto: 'Salidas de Efectivo',
      monto: totalOutflow,
      porcentaje: totalInflow > 0 ? (totalOutflow / totalInflow) * 100 : 0,
      tipo: 'expense' as const
    },
    {
      concepto: 'Flujo Neto de Efectivo',
      monto: netCashFlow,
      porcentaje: totalInflow > 0 ? (netCashFlow / totalInflow) * 100 : 0,
      tipo: netCashFlow >= 0 ? 'income' as const : 'expense' as const
    }
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Análisis de Flujo de Efectivo</h3>
            <p className="text-sm text-gray-500 mt-1">
              Seguimiento de entradas y salidas de efectivo
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewType === 'daily'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setViewType('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewType === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Semanal
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Entradas</span>
            </div>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalInflow)}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Salidas</span>
            </div>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalOutflow)}</p>
          </div>

          <div className={`${netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className={`w-4 h-4 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className={`text-sm font-medium ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Flujo Neto
              </span>
            </div>
            <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(netCashFlow)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Balance Final</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(finalBalance)}</p>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div id="cashflow-chart-container" className="w-full" style={{ height: 320 }}>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Flujo de Efectivo {viewType === 'daily' ? 'Diario' : 'Semanal'}
          </h4>
          {dimensions.width > 0 ? (
            <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
              <LineChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Line 
                  type="monotone" 
                  dataKey="flujoNeto" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Flujo Neto"
                />
                <Line 
                  type="monotone" 
                  dataKey="acumulado" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  name="Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-gray-400">Cargando gráfico...</div>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Resumen de Flujo de Efectivo</h4>
        
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[40%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="w-[20%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impacto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.tipo === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-gray-900">{item.concepto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-bold ${
                      item.tipo === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {item.tipo === 'income' ? '+' : item.monto < 0 ? '' : '-'}{formatCurrency(Math.abs(item.monto))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {Math.abs(item.porcentaje).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.tipo === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.tipo === 'income' ? 'Positivo' : 'Negativo'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}