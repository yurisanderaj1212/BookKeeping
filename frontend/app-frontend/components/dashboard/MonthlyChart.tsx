'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MonthlyData } from '../../data/dashboard-data'
import { MoreHorizontal } from 'lucide-react'

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 })

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('monthly-chart-container')
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

  // Transform data for Recharts
  const chartData = data.map((month) => ({
    name: month.month,
    income: month.income,
    expenses: month.expenses,
    profit: month.income - month.expenses
  }))

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

      <div id="monthly-chart-container" className="w-full" style={{ height: 320 }}>
        {dimensions.width > 0 && (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barCategoryGap="10%"
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="income" 
                name="Ingresos"
                fill="#20B2AA" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar 
                dataKey="expenses" 
                name="Gastos"
                fill="#FF8C42" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={300}
              />
              <Bar 
                dataKey="profit" 
                name="Ganancia"
                fill="#6366F1" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={600}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}