'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getSupabase } from '@/lib/supabaseClient'

interface YearComparisonProps {
  period: string
  year: string
  month: string
}

export default function YearComparison({ year }: YearComparisonProps) {
  const t      = useTranslations('analytics.components')
  const locale = useLocale()
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [yearData, setYearData]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const currentYear = parseInt(year)
        const years = [currentYear - 2, currentYear - 1, currentYear]

        const results = await Promise.all(years.map(async y => {
          const { data } = await supabase
            .from('transactions')
            .select('type, amount')
            .gte('date', `${y}-01-01`).lte('date', `${y}-12-31`)
            .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
          const rows = data ?? []
          const ingresos  = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
          const gastos    = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
          const beneficio = ingresos - gastos
          return { year: String(y), ingresos, gastos, beneficio, margen: ingresos > 0 ? (beneficio / ingresos) * 100 : 0 }
        }))

        if (!cancelled) setYearData(results)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [year])
  
  // Calculate year-over-year growth
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const yearComparisonData = yearData
  const currentYearData  = yearData.find(d => d.year === year)
  const previousYearData = yearData.find(d => d.year === String(parseInt(year) - 1))
  
  const incomeGrowth = currentYearData && previousYearData ? 
    calculateGrowth(currentYearData.ingresos, previousYearData.ingresos) : 0
  const expenseGrowth = currentYearData && previousYearData ? 
    calculateGrowth(currentYearData.gastos, previousYearData.gastos) : 0
  const profitGrowth = currentYearData && previousYearData ? 
    calculateGrowth(currentYearData.beneficio, previousYearData.beneficio) : 0

  // Find best and worst performing years
  const bestYear  = yearComparisonData.length > 0
    ? yearComparisonData.reduce((best, cur) => cur.beneficio > best.beneficio ? cur : best, yearComparisonData[0])
    : null
  const worstYear = yearComparisonData.length > 0
    ? yearComparisonData.reduce((worst, cur) => cur.beneficio < worst.beneficio ? cur : worst, yearComparisonData[0])
    : null

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('yearLabel', { year: label })}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? 'Ingresos' : 
               entry.dataKey === 'gastos' ? 'Gastos' : 
               entry.dataKey === 'beneficio' ? 'Beneficio' : 'Margen'}: 
              {entry.dataKey === 'margen' ? `${entry.value.toFixed(1)}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const GrowthCard = ({ 
    title, 
    current, 
    previous, 
    growth, 
    isPercentage = false 
  }: {
    title: string
    current: number
    previous: number
    growth: number
    isPercentage?: boolean
  }) => {
    const isPositive = growth >= 0
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    const bgClass = isPositive ? 'bg-green-100' : 'bg-red-100'

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          <div className={`${bgClass} p-1 rounded-full`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{year}</span>
            <span className="text-lg font-bold text-gray-900">
              {isPercentage ? `${current.toFixed(1)}%` : formatCurrency(current)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{parseInt(year) - 1}</span>
            <span className="text-sm text-gray-600">
              {isPercentage ? `${previous.toFixed(1)}%` : formatCurrency(previous)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">{t('growth')}</span>
            <span className={`text-sm font-medium ${colorClass}`}>
              {isPositive ? '+' : ''}{growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('yearComparison')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('annualPerformanceAnalysis')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                chartType === 'bar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tendencia
            </button>
          </div>
        </div>
      </div>

      {/* Year-over-Year Growth Cards */}
      {currentYearData && previousYearData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GrowthCard
            title="Ingresos"
            current={currentYearData.ingresos}
            previous={previousYearData.ingresos}
            growth={incomeGrowth}
          />
          <GrowthCard
            title="Gastos"
            current={currentYearData.gastos}
            previous={previousYearData.gastos}
            growth={expenseGrowth}
          />
          <GrowthCard
            title="Beneficio"
            current={currentYearData.beneficio}
            previous={previousYearData.beneficio}
            growth={profitGrowth}
          />
          <GrowthCard
            title="Margen"
            current={currentYearData.margen}
            previous={previousYearData.margen}
            growth={calculateGrowth(currentYearData.margen, previousYearData.margen)}
            isPercentage={true}
          />
        </div>
      )}

      {/* Year Comparison Chart */}
      <div className="w-full mb-6" style={{ height: 320 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400">{t('loading')}</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'bar' ? (
              <BarChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos"  fill="#10b981" radius={[4,4,0,0]} name={t('income')} />
                <Bar dataKey="gastos"    fill="#ef4444" radius={[4,4,0,0]} name={t('expenses')} />
                <Bar dataKey="beneficio" fill="#60a5fa" radius={[4,4,0,0]} name={t('profit')} />
              </BarChart>
            ) : (
              <LineChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ingresos"  stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name={t('income')} />
                <Line type="monotone" dataKey="gastos"    stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} name={t('expenses')} />
                <Line type="monotone" dataKey="beneficio" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#60a5fa', r: 5 }} name={t('profit')} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Year Comparison Table */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('yearSummary')}</h4>
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
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
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margen
                </th>
                <th className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {yearComparisonData.map((yearData, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${yearData.year === year ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{yearData.year}</span>
                      {yearData.year === year && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {t('current')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {formatCurrency(yearData.ingresos)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {formatCurrency(yearData.gastos)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    yearData.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(yearData.beneficio)}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {yearData.margen.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${
                      yearData.year === bestYear?.year ? 'bg-green-100 text-green-800' :
                      yearData.year === worstYear?.year ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{t('bestYearLabel')}</span>
          </div>
          <p className="text-lg font-bold text-green-700">{bestYear?.year ?? '—'}</p>
          <p className="text-xs text-green-600">
            Beneficio: {formatCurrency(bestYear?.beneficio ?? 0)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{t('avgGrowthLabel')}</span>
          </div>
          <p className="text-lg font-bold text-blue-700">
            {yearComparisonData.length > 1 ? 
              (((yearComparisonData[yearComparisonData.length - 1].beneficio / yearComparisonData[0].beneficio) ** (1 / (yearComparisonData.length - 1)) - 1) * 100).toFixed(1) 
              : 0}%
          </p>
          <p className="text-xs text-blue-600">{t('annualCompound')}</p>
        </div>
      </div>
    </div>
  )
}