'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'
import { getSupabase } from '@/lib/supabaseClient'
import InfoTooltip from '@/components/ui/InfoTooltip'

interface AnnualPerformanceProps {
  startDate: string | null
  endDate:   string | null
}

export default function AnnualPerformance({ startDate, endDate }: AnnualPerformanceProps) {
  const t        = useTranslations('analytics.components')
  const tReports = useTranslations('reports')
  const locale   = useLocale()
  const { formatCurrency } = useCurrency()
  const [annualData, setAnnualData] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const now = new Date()
        const start = startDate ?? `${now.getFullYear()}-01-01`
        const end   = endDate   ?? `${now.getFullYear()}-12-31`

        // Derive year from start date for month labels
        const startYear = new Date(start + 'T00:00:00').getFullYear()
        const endYear   = new Date(end   + 'T00:00:00').getFullYear()

        const { data } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', start)
          .lte('date', end)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

        if (cancelled) return
        const rows = data ?? []

        // Group by year-month
        const monthMap = new Map<string, { ingresos: number; gastos: number; year: number; month: number }>()
        for (const r of rows) {
          const d = new Date(r.date + 'T00:00:00')
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const ex = monthMap.get(key) ?? { ingresos: 0, gastos: 0, year: d.getFullYear(), month: d.getMonth() + 1 }
          if (r.type === 1) ex.ingresos += r.amount
          else ex.gastos += r.amount
          monthMap.set(key, ex)
        }

        // If range is within a single year, show all 12 months for that year
        let months: any[]
        if (startYear === endYear) {
          months = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1
            const key = `${startYear}-${String(m).padStart(2, '0')}`
            const w = monthMap.get(key) ?? { ingresos: 0, gastos: 0 }
            return {
              month:      tReports(`months.${m}` as any),
              monthShort: tReports(`months.${m}` as any).substring(0, 3),
              ingresos: w.ingresos,
              gastos: w.gastos,
              beneficio: w.ingresos - w.gastos,
            }
          })
        } else {
          // Multi-year range — show by month with year label
          months = Array.from(monthMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, v]) => {
              const label = new Date(v.year, v.month - 1, 1).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short', year: '2-digit' })
              return {
                month: label,
                monthShort: label,
                ingresos: v.ingresos,
                gastos: v.gastos,
                beneficio: v.ingresos - v.gastos,
              }
            })
        }

        if (!cancelled) setAnnualData(months)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [startDate, endDate, locale])

  const totalAnnualIncome   = annualData.reduce((s, m) => s + m.ingresos, 0)
  const totalAnnualExpenses = annualData.reduce((s, m) => s + m.gastos, 0)
  const totalAnnualProfit   = totalAnnualIncome - totalAnnualExpenses

  const monthsWithData = annualData.filter(m => m.ingresos > 0 || m.gastos > 0).length || 1
  const avgMonthlyIncome   = totalAnnualIncome   / monthsWithData
  const avgMonthlyExpenses = totalAnnualExpenses / monthsWithData

  const bestMonth = annualData.length > 0
    ? annualData.reduce((best, cur) => cur.beneficio > best.beneficio ? cur : best, annualData[0])
    : { month: '—', beneficio: 0 }

  // Derive year label from startDate
  const yearLabel = startDate
    ? String(new Date(startDate + 'T00:00:00').getFullYear())
    : String(new Date().getFullYear())

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income   = payload.find((p: any) => p.dataKey === 'ingresos')?.value ?? 0
      const expenses = payload.find((p: any) => p.dataKey === 'gastos')?.value ?? 0
      const profit   = income - expenses
      const margin   = income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0'
      const isLoss   = profit < 0
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          <p className="text-sm text-green-600">{t('income')}: {formatCurrency(income)}</p>
          <p className="text-sm text-red-500">{t('expenses')}: {formatCurrency(expenses)}</p>
          <p className="text-sm font-semibold" style={{ color: isLoss ? '#f97316' : '#60a5fa' }}>
            {isLoss ? t('loss') : t('profit')}: {formatCurrency(profit)}
          </p>
          <p className={`text-xs mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 ${isLoss ? 'text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {t('margin')}: <span className="font-semibold">{parseFloat(margin).toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('annualPerformanceTitle', { year: yearLabel })}</h3>
            <InfoTooltip title={t('annualInfoTitle')} description={t('annualInfoDesc')} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('monthlyBreakdown')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{t('annualIncome')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalAnnualIncome)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgMonthlyIncome)}{t('perMonth')}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">{t('annualExpenses')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalAnnualExpenses)}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgMonthlyExpenses)}{t('perMonth')}
          </p>
        </div>

        <div className={`${totalAnnualProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} p-3 sm:p-4 rounded-lg`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className={`w-3.5 h-3.5 ${totalAnnualProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
            <span className={`text-xs font-medium ${totalAnnualProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {t('annualProfit')}
            </span>
          </div>
          <p className={`text-base sm:text-xl font-bold ${totalAnnualProfit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {formatCurrency(totalAnnualProfit)}
          </p>
          <p className={`text-xs mt-0.5 hidden sm:block ${totalAnnualProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {t('margin')}: {totalAnnualIncome > 0 ? ((totalAnnualProfit / totalAnnualIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{t('bestMonth')}</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-purple-700 dark:text-purple-300 truncate">{bestMonth.month}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{formatCurrency(bestMonth.beneficio)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full mb-4" style={{ height: 280 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`
                  return `${value}`
                }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[3, 3, 0, 0]} name={t('income')} animationDuration={1200} />
              <Bar dataKey="gastos"   fill="#ef4444" radius={[3, 3, 0, 0]} name={t('expenses')} animationDuration={1200} animationBegin={200} />
              <Bar dataKey="beneficio" radius={[3, 3, 0, 0]} name={t('profit')} animationDuration={1200} animationBegin={400}>
                {annualData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.beneficio >= 0 ? '#60a5fa' : '#f97316'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {!loading && (
        <div className="flex items-center justify-center gap-5 mb-6">
          {[
            { color: '#10b981', label: t('income') },
            { color: '#ef4444', label: t('expenses') },
            { color: '#60a5fa', label: t('profit') },
            { color: '#f97316', label: t('loss') },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Breakdown Table */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('monthlyBreakdownTitle')}</h4>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full sm:w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('month')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('income')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('expenses')}</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('profit')}</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">●</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100">
              {annualData.map((monthData, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{monthData.monthShort ?? monthData.month}</td>
                  <td className="px-3 py-2 text-right text-xs text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">{formatCurrency(monthData.ingresos)}</td>
                  <td className="px-3 py-2 text-right text-xs text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">{formatCurrency(monthData.gastos)}</td>
                  <td className={`px-3 py-2 text-right text-xs font-semibold whitespace-nowrap ${monthData.beneficio >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {formatCurrency(monthData.beneficio)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${
                      monthData.beneficio > 0 ? 'bg-green-400' :
                      monthData.beneficio === 0 ? 'bg-yellow-400' : 'bg-red-400'
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
