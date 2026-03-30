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

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{t('annualIncome')}</span>
          </div>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalAnnualIncome)}</p>
          <p className="text-xs text-green-600 mt-1">
            {t('average')}: {formatCurrency(avgMonthlyIncome)}{t('perMonth')}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">{t('annualExpenses')}</span>
          </div>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalAnnualExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">
            {t('average')}: {formatCurrency(avgMonthlyExpenses)}{t('perMonth')}
          </p>
        </div>

        <div className={`${totalAnnualProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-sm font-medium ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {t('annualProfit')}
            </span>
          </div>
          <p className={`text-xl font-bold ${totalAnnualProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(totalAnnualProfit)}
          </p>
          <p className={`text-xs mt-1 ${totalAnnualProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {t('margin')}: {totalAnnualIncome > 0 ? ((totalAnnualProfit / totalAnnualIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">{t('bestMonth')}</span>
          </div>
          <p className="text-lg font-bold text-purple-700">{bestMonth.month}</p>
          <p className="text-xs text-purple-600 mt-1">{formatCurrency(bestMonth.beneficio)}</p>
        </div>
      </div>

      {/* Annual Performance Chart */}
      <div className="w-full mb-8" style={{ height: 384 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-gray-400">{t('loadingChart')}</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={384}>
            <BarChart data={annualData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name={t('income')} animationDuration={1500} />
              <Bar dataKey="gastos"   fill="#ef4444" radius={[4, 4, 0, 0]} name={t('expenses')} animationDuration={1500} animationBegin={300} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Performance Table */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">{t('monthlyBreakdownTitle')}</h4>
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('month')}
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('income')}
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('expenses')}
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('profit')}
                </th>
                <th className="w-[5%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {annualData.map((monthData, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{monthData.month}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatCurrency(monthData.ingresos)}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatCurrency(monthData.gastos)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${monthData.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
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
