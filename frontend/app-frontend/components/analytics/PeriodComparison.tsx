'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../data/transactions-data'

interface PeriodComparisonProps {
  period: string
  year: string
  month: string
}

// Mock comparison data
const mockComparisonData = [
  {
    period: 'Período Actual',
    ingresos: 22300,
    gastos: 10200,
    beneficio: 12100
  },
  {
    period: 'Período Anterior',
    ingresos: 19800,
    gastos: 9500,
    beneficio: 10300
  }
]

const mockDetailedComparison = {
  ingresos: {
    actual: 22300,
    anterior: 19800,
    cambio: 12.6,
    tendencia: 'up' as const
  },
  gastos: {
    actual: 10200,
    anterior: 9500,
    cambio: 7.4,
    tendencia: 'up' as const
  },
  beneficio: {
    actual: 12100,
    anterior: 10300,
    cambio: 17.5,
    tendencia: 'up' as const
  },
  transacciones: {
    actual: 45,
    anterior: 38,
    cambio: 18.4,
    tendencia: 'up' as const
  }
}

export default function PeriodComparison({ period }: PeriodComparisonProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 })
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('period-comparison-chart-container')
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

  const getPeriodLabel = () => {
    switch (period) {
      case 'month':
        return 'mes'
      case 'quarter':
        return 'trimestre'
      case 'year':
        return 'año'
      default:
        return 'período'
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
               entry.dataKey === 'gastos' ? 'Gastos' : 'Beneficio'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const ComparisonCard = ({ 
    title, 
    actual, 
    anterior, 
    cambio, 
    tendencia, 
    isPercentage = false 
  }: {
    title: string
    actual: number
    anterior: number
    cambio: number
    tendencia: 'up' | 'down'
    isPercentage?: boolean
  }) => {
    const isPositive = tendencia === 'up'
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    const bgClass = isPositive ? 'bg-green-100' : 'bg-red-100'

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          <div className={`${bgClass} p-1 rounded-full`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Actual</span>
            <span className="text-lg font-bold text-gray-900">
              {isPercentage ? actual.toString() : formatCurrency(actual)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Anterior</span>
            <span className="text-sm text-gray-600">
              {isPercentage ? anterior.toString() : formatCurrency(anterior)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Cambio</span>
            <span className={`text-sm font-medium ${colorClass}`}>
              {isPositive ? '+' : ''}{cambio.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Comparación de Períodos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Comparación con el {getPeriodLabel()} anterior
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Actualizado hace 2 horas</span>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ComparisonCard
          title="Ingresos"
          actual={mockDetailedComparison.ingresos.actual}
          anterior={mockDetailedComparison.ingresos.anterior}
          cambio={mockDetailedComparison.ingresos.cambio}
          tendencia={mockDetailedComparison.ingresos.tendencia}
        />
        <ComparisonCard
          title="Gastos"
          actual={mockDetailedComparison.gastos.actual}
          anterior={mockDetailedComparison.gastos.anterior}
          cambio={mockDetailedComparison.gastos.cambio}
          tendencia={mockDetailedComparison.gastos.tendencia}
        />
        <ComparisonCard
          title="Beneficio"
          actual={mockDetailedComparison.beneficio.actual}
          anterior={mockDetailedComparison.beneficio.anterior}
          cambio={mockDetailedComparison.beneficio.cambio}
          tendencia={mockDetailedComparison.beneficio.tendencia}
        />
        <ComparisonCard
          title="Transacciones"
          actual={mockDetailedComparison.transacciones.actual}
          anterior={mockDetailedComparison.transacciones.anterior}
          cambio={mockDetailedComparison.transacciones.cambio}
          tendencia={mockDetailedComparison.transacciones.tendencia}
          isPercentage={true}
        />
      </div>

      {/* Comparison Chart */}
      <div id="period-comparison-chart-container" className="w-full" style={{ height: 320 }}>
        <h4 className="text-md font-medium text-gray-900 mb-4">Comparación Visual</h4>
        {dimensions.width > 0 ? (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <BarChart data={mockComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
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
              <Bar dataKey="beneficio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-gray-400">Cargando gráfico...</div>
          </div>
        )}
      </div>
    </div>
  )
}