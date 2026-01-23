'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { WeeklyData } from '../../data/dashboard-data'
import { MoreHorizontal } from 'lucide-react'

interface WeeklyChartProps {
  data: WeeklyData[]
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

export default function WeeklyChart({ data }: WeeklyChartProps) {
  // Transform data for Recharts - show only last 4 weeks (current month)
  const chartData = data.slice(-4).map((week, index) => ({
    name: `Semana ${index + 1}`,
    income: week.income,
    expenses: week.expenses,
    profit: week.income - week.expenses
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Comparación Semanal</h3>
          <p className="text-sm text-gray-500 mt-1">Ingresos vs Gastos por Semana</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="h-80 w-full">
        <div className="w-full h-full min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barCategoryGap="20%"
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
            <Bar 
              dataKey="income" 
              name="Ingresos"
              fill="#20B2AA" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            />
            <Bar 
              dataKey="expenses" 
              name="Gastos"
              fill="#FF6B6B" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />
            <Bar 
              dataKey="profit" 
              name="Ganancia"
              fill="#4ECDC4" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}