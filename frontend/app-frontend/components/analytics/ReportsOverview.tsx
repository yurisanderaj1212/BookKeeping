'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react'
import { getTotalIncome, getTotalExpenses, getNetProfit, formatCurrency, mockTransactions } from '../../data/transactions-data'

interface ReportsOverviewProps {
  period: string
  year: string
  month: string
}

// Generate chart data from real transactions
const generateChartData = (period: string) => {
  if (period === 'month') {
    // Weekly data for current month
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
    return weeks.map((week, index) => {
      // Simulate weekly distribution of transactions
      const weekTransactions = mockTransactions.filter((_, i) => Math.floor(i / 6) === index)
      const ingresos = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const gastos = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return { name: week, ingresos, gastos }
    })
  } else {
    // Monthly data for year view
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    return months.map((month, index) => {
      // Simulate monthly distribution
      const monthTransactions = mockTransactions.filter((_, i) => Math.floor(i / 4) === index)
      const ingresos = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const gastos = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return { name: month, ingresos, gastos }
    })
  }
}

export default function ReportsOverview({ period }: ReportsOverviewProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0

  const chartData = generateChartData(period)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? 'Ingresos' : 'Gastos'}: {formatCurrency(entry.value)}
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
        {/* Total Income */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-600">
              +12.5%
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Ingresos totales</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div className="bg-red-100 px-2 py-1 rounded text-xs font-medium text-red-600">
              +8.3%
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Gastos totales</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-600">
              +18.2%
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Beneficio neto</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(netProfit)}</p>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-600">
              +5.1%
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Margen de beneficio</p>
          <p className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ingresos vs Gastos</h3>
              <p className="text-sm text-gray-500 mt-1">
                Comparación {period === 'month' ? 'semanal' : 'mensual'}
              </p>
            </div>
          </div>
          
          <div className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

        {/* Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tendencia de Beneficios</h3>
              <p className="text-sm text-gray-500 mt-1">
                Evolución {period === 'month' ? 'semanal' : 'mensual'} del beneficio neto
              </p>
            </div>
          </div>
          
          <div className="h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.map(item => ({ 
                  ...item, 
                  beneficio: item.ingresos - item.gastos 
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Beneficio']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="beneficio" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}