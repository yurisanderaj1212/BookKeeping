'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { formatCurrency, getTotalIncomeFiltered, getTotalExpensesFiltered } from '@/data/transactions-data'

interface AnnualPerformanceProps {
  period: string
  year: string
  month: string
}

export default function AnnualPerformance({ year }: AnnualPerformanceProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 384 })
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('annual-chart-container')
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: 384
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

  // Generate monthly data for the selected year
  const generateAnnualData = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    return months.map((monthName, index) => {
      const monthStart = `${year}-${(index + 1).toString().padStart(2, '0')}-01`
      const monthEnd = new Date(parseInt(year), index + 1, 0).toISOString().split('T')[0]
      
      const monthlyIncome = getTotalIncomeFiltered(monthStart, monthEnd)
      const monthlyExpenses = getTotalExpensesFiltered(monthStart, monthEnd)
      const monthlyProfit = monthlyIncome - monthlyExpenses
      
      return {
        month: monthName,
        monthShort: monthName.substring(0, 3),
        ingresos: monthlyIncome,
        gastos: monthlyExpenses,
        beneficio: monthlyProfit
      }
    })
  }

  const annualData = generateAnnualData()
  const totalAnnualIncome = annualData.reduce((sum, month) => sum + month.ingresos, 0)
  const totalAnnualExpenses = annualData.reduce((sum, month) => sum + month.gastos, 0)
  const totalAnnualProfit = totalAnnualIncome - totalAnnualExpenses
  const avgMonthlyIncome = totalAnnualIncome / 12
  const avgMonthlyExpenses = totalAnnualExpenses / 12

  // Find best and worst performing months
  const bestMonth = annualData.reduce((best, current) => 
    current.beneficio > best.beneficio ? current : best
  )

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Actuación Anual {year}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Ingresos y gastos mensuales a lo largo del año
          </p>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Ingresos Anuales</span>
          </div>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalAnnualIncome)}</p>
          <p className="text-xs text-green-600 mt-1">
            Promedio: {formatCurrency(avgMonthlyIncome)}/mes
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">Gastos Anuales</span>
          </div>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalAnnualExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">
            Promedio: {formatCurrency(avgMonthlyExpenses)}/mes
          </p>
        </div>

        <div className={`${totalAnnualProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className={`w-4 h-4 ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-sm font-medium ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Beneficio Anual
            </span>
          </div>
          <p className={`text-xl font-bold ${totalAnnualProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(totalAnnualProfit)}
          </p>
          <p className={`text-xs mt-1 ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Margen: {totalAnnualIncome > 0 ? ((totalAnnualProfit / totalAnnualIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Mejor Mes</span>
          </div>
          <p className="text-lg font-bold text-purple-700">{bestMonth.month}</p>
          <p className="text-xs text-purple-600 mt-1">
            {formatCurrency(bestMonth.beneficio)}
          </p>
        </div>
      </div>

      {/* Annual Performance Chart - Only Bars */}
      <div id="annual-chart-container" className="w-full" style={{ height: 384 }}>
        {dimensions.width > 0 ? (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <BarChart data={annualData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="monthShort" 
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
              <Bar 
                dataKey="ingresos" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                name="Ingresos"
                animationDuration={1500}
              />
              <Bar 
                dataKey="gastos" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
                name="Gastos"
                animationDuration={1500}
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-gray-400">Cargando gráfico...</div>
          </div>
        )}
      </div>

      {/* Monthly Performance Table */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Desglose Mensual</h4>
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mes
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio
                </th>
                <th className="w-[5%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {annualData.map((monthData, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{monthData.month}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {formatCurrency(monthData.ingresos)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {formatCurrency(monthData.gastos)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    monthData.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(monthData.beneficio)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto ${
                      monthData.beneficio >= avgMonthlyIncome * 0.1 ? 'bg-green-500' :
                      monthData.beneficio >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
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