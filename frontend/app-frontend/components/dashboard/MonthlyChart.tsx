'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MonthlyData } from '../../data/dashboard-data'
import { MoreHorizontal, TrendingUp } from 'lucide-react'

interface MonthlyChartProps {
  data: MonthlyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'income' ? 'Ingresos' : 
             entry.dataKey === 'expenses' ? 'Gastos' : 'Ganancia'}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  // Transform data for Recharts
  const chartData = data.map((month) => ({
    name: month.month,
    income: month.income,
    expenses: month.expenses,
    profit: month.income - month.expenses
  }))

  // Calculate growth
  const currentMonth = data[data.length - 1]
  const previousMonth = data[data.length - 2]
  const growth = previousMonth ? 
    ((currentMonth.income - currentMonth.expenses) - (previousMonth.income - previousMonth.expenses)) / 
    (previousMonth.income - previousMonth.expenses) * 100 : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tendencias Mensuales</h3>
          <p className="text-sm text-gray-500 mt-1">Rendimiento en los últimos 6 meses</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="h-80 w-full">
        <div className="w-full h-full min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
              bottom: 5,
            }}
          >
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="Ingresos"
              stroke="#20B2AA" 
              strokeWidth={3}
              dot={{ fill: '#20B2AA', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#20B2AA', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              name="Gastos"
              stroke="#FF8C42" 
              strokeWidth={3}
              dot={{ fill: '#FF8C42', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#FF8C42', strokeWidth: 2 }}
              animationDuration={1500}
              animationBegin={300}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Ganancia"
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#6366F1', strokeWidth: 2 }}
              animationDuration={1500}
              animationBegin={600}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Growth indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`w-4 h-4 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm text-gray-600">Crecimiento Mensual</span>
          </div>
          <span className={`text-sm font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}