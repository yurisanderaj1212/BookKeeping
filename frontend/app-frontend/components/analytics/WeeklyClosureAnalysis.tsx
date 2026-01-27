'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/data/transactions-data'

interface WeeklyClosureAnalysisProps {
  period: string
  year: string
  month: string
}

// Mock data for weekly closures - Fixed to avoid duplicates
const mockWeeklyClosures = [
  {
    week: 'Semana 1 - Enero',
    weekNumber: 1,
    month: 'Enero',
    status: 'Cerrada',
    income: 4300,
    expenses: 1200,
    profit: 3100,
    closedDate: '2024-01-07',
    transactionCount: 12
  },
  {
    week: 'Semana 2 - Enero',
    weekNumber: 2,
    month: 'Enero',
    status: 'Cerrada',
    income: 3800,
    expenses: 1500,
    profit: 2300,
    closedDate: '2024-01-14',
    transactionCount: 15
  },
  {
    week: 'Semana 3 - Enero',
    weekNumber: 3,
    month: 'Enero',
    status: 'Cerrada',
    income: 5200,
    expenses: 1800,
    profit: 3400,
    closedDate: '2024-01-21',
    transactionCount: 18
  },
  {
    week: 'Semana 4 - Enero',
    weekNumber: 4,
    month: 'Enero',
    status: 'Cerrada',
    income: 2800,
    expenses: 1100,
    profit: 1700,
    closedDate: '2024-01-28',
    transactionCount: 10
  },
  {
    week: 'Semana 5 - Enero',
    weekNumber: 5,
    month: 'Enero',
    status: 'Pendiente',
    income: 2100,
    expenses: 900,
    profit: 1200,
    closedDate: null,
    transactionCount: 8
  },
  {
    week: 'Semana 1 - Febrero',
    weekNumber: 1,
    month: 'Febrero',
    status: 'Abierta',
    income: 1800,
    expenses: 600,
    profit: 1200,
    closedDate: null,
    transactionCount: 6
  }
]

export default function WeeklyClosureAnalysis({ period, year, month }: WeeklyClosureAnalysisProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate summary statistics
  const closedWeeks = mockWeeklyClosures.filter(w => w.status === 'Cerrada')
  const pendingWeeks = mockWeeklyClosures.filter(w => w.status === 'Pendiente')
  const openWeeks = mockWeeklyClosures.filter(w => w.status === 'Abierta')

  const totalClosedIncome = closedWeeks.reduce((sum, w) => sum + w.income, 0)
  const totalClosedExpenses = closedWeeks.reduce((sum, w) => sum + w.expenses, 0)
  const totalClosedProfit = totalClosedIncome - totalClosedExpenses
  const avgWeeklyProfit = closedWeeks.length > 0 ? totalClosedProfit / closedWeeks.length : 0

  // Status distribution for summary
  const statusData = [
    { name: 'Cerradas', value: closedWeeks.length, color: '#10b981' },
    { name: 'Pendientes', value: pendingWeeks.length, color: '#f59e0b' },
    { name: 'Abiertas', value: openWeeks.length, color: '#3b82f6' }
  ]

  // Weekly performance data for bar chart - Generate unique weeks
  const weeklyPerformanceData = mockWeeklyClosures.slice(0, 5).map((week, index) => ({
    name: `S${index + 1}`,
    fullName: week.week,
    ingresos: week.income,
    gastos: week.expenses,
    beneficio: week.profit,
    status: week.status
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data?.fullName}</p>
          <p className="text-sm text-gray-600 mb-1">Estado: {data?.status}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? 'Ingresos' : 
               entry.dataKey === 'gastos' ? 'Gastos' : 'Beneficio'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Closed Weeks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-600">
              {((closedWeeks.length / mockWeeklyClosures.length) * 100).toFixed(0)}%
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Semanas Cerradas</p>
          <p className="text-2xl font-bold text-gray-900">{closedWeeks.length}</p>
        </div>

        {/* Pending Weeks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="bg-yellow-100 px-2 py-1 rounded text-xs font-medium text-yellow-600">
              {pendingWeeks.length > 0 ? 'Pendiente' : 'Al día'}
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Semanas Pendientes</p>
          <p className="text-2xl font-bold text-gray-900">{pendingWeeks.length}</p>
        </div>

        {/* Total Closed Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-600">
              Cerradas
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Ingresos Cerrados</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClosedIncome)}</p>
        </div>

        {/* Average Weekly Profit */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="bg-blue-100 px-2 py-1 rounded text-xs font-medium text-blue-600">
              Promedio
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Beneficio Semanal Promedio</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgWeeklyProfit)}</p>
        </div>
      </div>

      {/* Charts - Only Weekly Performance */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Performance Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rendimiento Semanal</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ingresos, gastos y beneficios por semana
              </p>
            </div>
          </div>
          
          <div className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Closure Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historial de Cierres Semanales</h3>
            <p className="text-sm text-gray-500 mt-1">
              Detalle de todas las semanas y su estado de cierre
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semana
                </th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-[20%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="w-[20%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="w-[20%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockWeeklyClosures.map((week, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{week.week}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      week.status === 'Cerrada' ? 'bg-green-100 text-green-800' :
                      week.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {week.status === 'Cerrada' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {week.status === 'Pendiente' && <Clock className="w-3 h-3 mr-1" />}
                      {week.status === 'Abierta' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {week.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {formatCurrency(week.income)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {formatCurrency(week.expenses)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    week.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(week.profit)}
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