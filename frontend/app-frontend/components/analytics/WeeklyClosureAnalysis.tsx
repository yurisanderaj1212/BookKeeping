'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3, Calendar } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'
import { getSupabase } from '@/lib/supabaseClient'
import InfoTooltip from '@/components/ui/InfoTooltip'

interface WeeklyClosureAnalysisProps {
  startDate: string | null
  endDate:   string | null
}

interface WeekData {
  label:     string  // e.g. "Apr 1-7"
  ingresos:  number
  gastos:    number
  beneficio: number
  start:     string
  end:       string
}

export default function WeeklyClosureAnalysis({ startDate, endDate }: WeeklyClosureAnalysisProps) {
  const t      = useTranslations('analytics.components')
  const locale = useLocale()
  const { formatCurrency } = useCurrency()
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [loading, setLoading]   = useState(true)

  // Derive the month to display from startDate (or current month)
  const now = new Date()
  const refDate = startDate ? new Date(startDate + 'T00:00:00') : now
  const refYear  = refDate.getFullYear()
  const refMonth = refDate.getMonth() // 0-indexed

  // Month label for the header
  const monthLabel = refDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()

        // Always show the full month derived from startDate
        const monthStart = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-01`
        const monthEnd   = new Date(refYear, refMonth + 1, 0).toISOString().split('T')[0]

        const { data } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

        if (cancelled) return
        const rows = data ?? []

        // Build weeks: Sunday-based, covering the full month
        const firstOfMonth = new Date(refYear, refMonth, 1)
        const firstSunday  = new Date(firstOfMonth)
        firstSunday.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())

        const fmtD = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        const fmtLabel = (s: Date, e: Date) => {
          const mName = s.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short' })
          return `${mName} ${s.getDate()}-${e.getDate()}`
        }

        const weeks: WeekData[] = []
        for (let i = 0; i < 6; i++) {
          const wStart = new Date(firstSunday)
          wStart.setDate(firstSunday.getDate() + i * 7)
          const wEnd = new Date(wStart)
          wEnd.setDate(wStart.getDate() + 6)

          // Only include weeks that overlap with the month
          const monthEndDate = new Date(refYear, refMonth + 1, 0)
          if (wStart > monthEndDate) break

          const wStartStr = fmtD(wStart)
          const wEndStr   = fmtD(wEnd)

          const weekRows = rows.filter(r => {
            const d = (r.date ?? '').substring(0, 10)
            return d >= wStartStr && d <= wEndStr
          })

          const ing = weekRows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
          const gas = weekRows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)

          weeks.push({
            label:     fmtLabel(wStart, wEnd),
            ingresos:  ing,
            gastos:    gas,
            beneficio: ing - gas,
            start:     wStartStr,
            end:       wEndStr,
          })
        }

        if (!cancelled) setWeekData(weeks)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [startDate, endDate, refYear, refMonth, locale])

  // Summary stats
  const totalIncome   = weekData.reduce((s, w) => s + w.ingresos, 0)
  const totalExpenses = weekData.reduce((s, w) => s + w.gastos, 0)
  const totalProfit   = totalIncome - totalExpenses

  const weeksWithData = weekData.filter(w => w.ingresos > 0 || w.gastos > 0).length || 1
  const avgWeeklyIncome   = totalIncome   / weeksWithData
  const avgWeeklyExpenses = totalExpenses / weeksWithData

  const bestWeek = weekData.length > 0
    ? weekData.reduce((best, cur) => cur.beneficio > best.beneficio ? cur : best, weekData[0])
    : { label: '—', beneficio: 0 }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const income   = payload.find((p: any) => p.dataKey === 'ingresos')?.value ?? 0
    const expenses = payload.find((p: any) => p.dataKey === 'gastos')?.value   ?? 0
    const profit   = income - expenses
    const isLoss   = profit < 0
    const margin   = income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0'
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {t('weeklyPerformance')} — {monthLabel}
            </h3>
            <InfoTooltip title={t('weeklyPerfInfoTitle')} description={t('weeklyPerfInfoDesc')} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('weeklyClosureSubtitle')}</p>
        </div>
      </div>

      {/* Summary Cards — same style as AnnualPerformance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Monthly Income */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{t('monthlyIncome')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-green-700 dark:text-green-300">
            {loading ? '—' : formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgWeeklyIncome)}{t('perWeek')}
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">{t('monthlyExpenses')}</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-red-700 dark:text-red-300">
            {loading ? '—' : formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 hidden sm:block">
            {t('average')}: {formatCurrency(avgWeeklyExpenses)}{t('perWeek')}
          </p>
        </div>

        {/* Monthly Profit/Loss */}
        <div className={`${totalProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} p-3 sm:p-4 rounded-lg`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className={`w-3.5 h-3.5 ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
            <span className={`text-xs font-medium ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {t('annualProfit')}
            </span>
          </div>
          <p className={`text-base sm:text-xl font-bold ${totalProfit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {loading ? '—' : formatCurrency(totalProfit)}
          </p>
          <p className={`text-xs mt-0.5 hidden sm:block ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {t('margin')}: {totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>

        {/* Best Week */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{t('bestWeek')}</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300 truncate">
            {loading ? '—' : bestWeek.label}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
            {loading ? '' : formatCurrency(bestWeek.beneficio)}
          </p>
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
            <BarChart data={weekData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={56}
                tickFormatter={v => v === 0 ? '$0' : Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos"  fill="#10b981" radius={[3,3,0,0]} name={t('income')}   animationDuration={1200} />
              <Bar dataKey="gastos"    fill="#ef4444" radius={[3,3,0,0]} name={t('expenses')} animationDuration={1200} animationBegin={200} />
              <Bar dataKey="beneficio" radius={[3,3,0,0]} name={t('profit')} animationDuration={1200} animationBegin={400}>
                {weekData.map((entry, index) => (
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

      {/* Weekly Breakdown Table */}
      {!loading && weekData.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('weeklyHistory')}</h4>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full sm:w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('week')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('income')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('expenses')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{t('profit')}</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">●</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                {weekData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{row.label}</td>
                    <td className="px-3 py-2 text-right text-xs text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">{formatCurrency(row.ingresos)}</td>
                    <td className="px-3 py-2 text-right text-xs text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">{formatCurrency(row.gastos)}</td>
                    <td className={`px-3 py-2 text-right text-xs font-semibold whitespace-nowrap ${row.beneficio >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {formatCurrency(row.beneficio)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto ${
                        row.beneficio > 0 ? 'bg-green-400' :
                        row.beneficio === 0 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && weekData.every(w => w.ingresos === 0 && w.gastos === 0) && (
        <div className="py-8 text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('noDataPeriod')}</p>
        </div>
      )}
    </div>
  )
}
