'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CategoryData } from '../../data/dashboard-data'
import { useLanguage } from '../../hooks/useLanguage'
import { MoreHorizontal } from 'lucide-react'

interface CategoryBreakdownProps {
  categories: CategoryData[]
}

const CustomTooltip = ({ active, payload }: any) => {
  const { language } = useLanguage()
  
  const formatCurrency = (amount: number): string => {
    if (language === 'es') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{data.name}</p>
        <p className="text-sm text-gray-600">
          Amount: <span className="font-semibold">{formatCurrency(data.value)}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-semibold">{data.percentage}%</span>
        </p>
      </div>
    )
  }
  return null
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  // Don't show any labels on the pie chart slices
  return null
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const formatCurrency = (amount: number): string => {
    if (language === 'es') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Transform data for PieChart
  const chartData = categories.map((category) => ({
    name: category.name,
    value: category.amount,
    percentage: category.percentage,
    color: category.color,
    icon: category.icon
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Income by Category</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution of revenue sources</p>
        </div>
        <div className="flex items-center space-x-2">
          {categories.length > 4 && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200">
              <span>Ver todas</span>
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Pie Chart */}
          <div className="h-64 mb-6 w-full flex items-center justify-center">
            {mounted ? (
              <div className="w-80 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-80 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>

          {/* Category List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <div className="space-y-1 max-h-40 overflow-hidden">
                {categories.slice(0, 4).map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">{category.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No categories yet</p>
            <p className="text-gray-400 text-xs mt-1">Add transactions to see category breakdown</p>
          </div>
        </div>
      )}
    </div>
  )
}