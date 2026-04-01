'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getSupabase } from '@/lib/supabaseClient'

interface AnnualPerformanceProps {
  period: string
  year:   string
  month:  string
}

export default function AnnualPerformance({ year }: AnnualPerformanceProps) {
  const t        = useTranslations('analytics.components')
  const tReports = useTranslations('reports')
  const locale   = useLocale()
  const [annualData, setAnnualData] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
        if (cancelled) return
        const rows = data ?? []
        const months = Array.from({ length: 12 }, (_, i) => {
          const m = i + 1
          const monthRows = rows.filter(r => new Date(r.date).getMonth() + 1 === m)
          const ingresos  = monthRows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
          const gastos    = monthRows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
          return {
            month:      tReports(`months.${m}` as any),
            monthShort: tReports(`months.${m}` as any).substring(0, 3),
            ingresos, gastos, beneficio: ingresos - gastos,
          }
        })
        if (!cancelled) setAnnualData(months)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [year])

  const totalAnnualIncome   = annualData.reduce((s, m) => s + m.ingresos, 0)
  const totalAnnualExpenses = annualData.reduce((s, m) => s + m.gastos, 0)
  const totalAnnualProfit   = totalAnnualIncome - totalAnnualExpenses
  const avgMonthlyIncome    = totalAnnualIncome / 12
  const avgMonthlyExpenses  = totalAnnualExpenses / 12
  const bestMonth = annualData.length > 0
    ? annualData.reduce((best, cur) => cur.beneficio > best.beneficio ? cur : best, annualData[0])
    : { month: '—', beneficio: 0 }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'ingresos' ? t('income') :
               entry.dataKey === 'gastos' ? t('expenses') : t('profit')}: {formatCurrency(entry.value)}
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
          <h3 className="text-lg font-semibold text-gray-900">{t('annualPerformanceTitle', { year })}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('monthlyBreakdown')}</p>
        </div>
      </div>

      {/* Annual Summary Cards — 2x2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-600">{t('annualIncome')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-green-700">{formatCurrency(totalAnnualIncome)}</p>
          <p className="text-xs text-green-600 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgMonthlyIncome)}{t('perMonth')}
          </p>
        </div>

        <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-medium text-red-600">{t('annualExpenses')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-red-700">{formatCurrency(totalAnnualExpenses)}</p>
          <p className="text-xs text-red-600 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgMonthlyExpenses)}{t('perMonth')}
          </p>
        </div>

        <div className={`${totalAnnualProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-3 sm:p-4 rounded-lg`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className={`w-3.5 h-3.5 ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-xs font-medium ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {t('annualProfit')}
            </span>
          </div>
          <p className={`text-base sm:text-xl font-bold ${totalAnnualProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(totalAnnualProfit)}
          </p>
          <p className={`text-xs mt-0.5 hidden sm:block ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {t('margin')}: {totalAnnualIncome > 0 ? ((totalAnnualProfit / totalAnnualIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">{t('bestMonth')}</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-purple-700 truncate">{bestMonth.month}</p>
          <p className="text-xs text-purple-600 mt-0.5">{formatCurrency(bestMonth.beneficio)}</p>
        </div>
      </div>

      {/* Annual Performance Chart — responsive height */}
      <div className="w-full mb-6" style={{ height: 280 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-gray-400">{t('loadingChart')}</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={annualData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={56}
                tickFormatter={(value) => {
                  if (value === 0) return '$0'
                  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`
                  return `$${value}`
                }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[3, 3, 0, 0]} name={t('income')} animationDuration={1200} />
              <Bar dataKey="gastos"   fill="#ef4444" radius={[3, 3, 0, 0]} name={t('expenses')} animationDuration={1200} animationBegin={200} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Breakdown Table — scrollable on mobile */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('monthlyBreakdownTitle')}</h4>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full sm:w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{t('month')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{t('income')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{t('expenses')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{t('profit')}</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">●</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {annualData.map((monthData, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{monthData.monthShort ?? monthData.month}</td>
                  <td className="px-3 py-2 text-right text-xs text-green-600 font-semibold whitespace-nowrap">{formatCurrency(monthData.ingresos)}</td>
                  <td className="px-3 py-2 text-right text-xs text-red-600 font-semibold whitespace-nowrap">{formatCurrency(monthData.gastos)}</td>
                  <td className={`px-3 py-2 text-right text-xs font-semibold whitespace-nowrap ${monthData.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(monthData.beneficio)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${
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
