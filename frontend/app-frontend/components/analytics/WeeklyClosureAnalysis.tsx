'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'
import { getSupabase } from '@/lib/supabaseClient'
import InfoTooltip from '@/components/ui/InfoTooltip'

interface WeeklyClosureAnalysisProps {
  period: string
  year:   string
  month:  string
}

interface ClosureRow {
  id:           number
  week_number:  number
  start_date:   string
  end_date:     string
  total_income: number
  total_expenses: number
  net_profit:   number
  closed_at:    string | null
}

export default function WeeklyClosureAnalysis({ year, month }: WeeklyClosureAnalysisProps) {
  const t      = useTranslations('analytics.components')
  const locale = useLocale()
  const { formatCurrency } = useCurrency()
  const [closures, setClosures] = useState<ClosureRow[]>([])
  const [loading, setLoading]   = useState(true)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        // Get closure records for status/dates
        const { data: closureData } = await supabase
          .from('week_closures')
          .select('id, week_number, start_date, end_date, total_income, total_expenses, net_profit, closed_at')
          .eq('year', parseInt(year))
          .eq('month', parseInt(month))
          .order('week_number')

        const closureRows = closureData ?? []

        // Get all transactions for the month to calculate real values
        const monthStart = `${year}-${String(parseInt(month)).padStart(2, '0')}-01`
        const monthEnd   = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
        const { data: txData } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

        const txs = txData ?? []

        // Recalculate income/expenses per week from real transactions
        const enriched = closureRows.map(row => {
          const weekTxs = txs.filter(tx => tx.date >= row.start_date && tx.date <= row.end_date)
          const income   = weekTxs.filter(tx => tx.type === 1).reduce((s, tx) => s + tx.amount, 0)
          const expenses = weekTxs.filter(tx => tx.type === 2).reduce((s, tx) => s + tx.amount, 0)
          return { ...row, total_income: income, total_expenses: expenses, net_profit: income - expenses }
        })

        if (!cancelled) setClosures(enriched)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [year, month])

  const getStatus = (row: ClosureRow): 'closed' | 'open' =>
    row.closed_at ? 'closed' : 'open'

  const closed  = closures.filter(r => getStatus(r) === 'closed')
  const open    = closures.filter(r => getStatus(r) === 'open')

  const totalClosedIncome  = closed.reduce((s, r) => s + r.total_income, 0)
  const totalClosedExpenses = closed.reduce((s, r) => s + r.total_expenses, 0)
  const totalClosedProfit  = totalClosedIncome - totalClosedExpenses
  const avgWeeklyProfit    = closed.length > 0 ? totalClosedProfit / closed.length : 0

  // Format date range label: "Apr 5 - 11"
  const fmtRange = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end   + 'T00:00:00')
    const monthName = s.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short' })
    return `${monthName} ${s.getDate()}-${e.getDate()}`
  }

  const chartData = closures.map(r => ({
    name:      fmtRange(r.start_date, r.end_date),
    fullName:  `${t('week')} ${r.week_number} · ${fmtRange(r.start_date, r.end_date)}`,
    ingresos:  r.total_income,
    gastos:    r.total_expenses,
    beneficio: r.net_profit,
    status:    getStatus(r),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    const income   = d?.ingresos  ?? 0
    const expenses = d?.gastos    ?? 0
    const profit   = d?.beneficio ?? 0
    const margin   = income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0'
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{d?.fullName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('status')}: {d?.status === 'closed' ? t('statusClosed') : t('statusOpen')}</p>
        <p className="text-sm" style={{ color: '#10b981' }}>{t('income')}: {formatCurrency(income)}</p>
        <p className="text-sm" style={{ color: '#ef4444' }}>{t('expenses')}: {formatCurrency(expenses)}</p>
        <p className="text-sm" style={{ color: '#60a5fa' }}>{t('profit')}: {formatCurrency(profit)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
          {t('margin')}: <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'} style={{ fontWeight: 600 }}>{margin}%</span>
        </p>
      </div>
    )
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle, bg: 'bg-green-100', iconColor: 'text-green-600 dark:text-green-400', badgeBg: 'bg-green-100', badgeText: 'text-green-600 dark:text-green-400',
            badge: closures.length > 0 ? `${((closed.length / closures.length) * 100).toFixed(0)}%` : '0%',
            label: t('closedWeeks'), value: closed.length },
          { icon: Clock, bg: 'bg-yellow-100', iconColor: 'text-yellow-600 dark:text-yellow-400', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-600 dark:text-yellow-400',
            badge: open.length > 0 ? t('pending') : t('upToDate'),
            label: t('pendingWeeks'), value: open.length },
          { icon: TrendingUp, bg: 'bg-blue-100', iconColor: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-green-100', badgeText: 'text-green-600 dark:text-green-400',
            badge: t('closed'),
            label: t('closedIncome'), value: formatCurrency(totalClosedIncome), isCurrency: true },
          { icon: TrendingUp, bg: 'bg-purple-100', iconColor: 'text-purple-600 dark:text-purple-400', badgeBg: 'bg-blue-100', badgeText: 'text-blue-600 dark:text-blue-400',
            badge: t('average'),
            label: t('avgWeeklyProfit'), value: formatCurrency(avgWeeklyProfit), isCurrency: true },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.bg} p-2 rounded-lg`}><Icon className={`w-5 h-5 ${card.iconColor}`} /></div>
                <div className={`${card.badgeBg} px-2 py-1 rounded text-xs font-medium ${card.badgeText}`}>{card.badge}</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">{card.isCurrency ? card.value : card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('weeklyPerformance')}</h3>
                <InfoTooltip title={t('weeklyPerfInfoTitle')} description={t('weeklyPerfInfoDesc')} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('weeklyClosureSubtitle')}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={-25} textAnchor="end" interval={0}
                dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                tickCount={5}
                tickFormatter={v => {
                  if (v === 0) return '$0'
                  if (v >= 1000) return `$${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
                  return `$${v}`
                }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos"  fill="#10b981" radius={[4,4,0,0]} name={t('income')} />
              <Bar dataKey="gastos"    fill="#ef4444" radius={[4,4,0,0]} name={t('expenses')} />
              <Bar dataKey="beneficio" fill="#60a5fa" radius={[4,4,0,0]} name={t('profit')} />
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-3">
            {[
              { color: '#10b981', label: t('income') },
              { color: '#ef4444', label: t('expenses') },
              { color: '#60a5fa', label: t('profit') },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {closures.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('weeklyHistory')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('weeklyHistorySubtitle')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[t('week'), t('status'), t('income'), t('expenses'), t('profit')].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {closures.map(row => {
                  const status = getStatus(row)
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{t('week')} {row.week_number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status === 'closed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {status === 'closed' ? t('statusClosed') : t('statusOpen')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">{formatCurrency(row.total_income)}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">{formatCurrency(row.total_expenses)}</td>
                      <td className={`px-4 py-3 font-semibold ${row.net_profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {formatCurrency(row.net_profit)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {closures.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noDataPeriod')}</p>
        </div>
      )}
    </div>
  )
}


