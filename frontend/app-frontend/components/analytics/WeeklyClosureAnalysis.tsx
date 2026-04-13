﻿'use client'

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
  id:             number
  week_number:    number
  start_date:     string
  end_date:       string
  total_income:   number
  total_expenses: number
  net_profit:     number
  closed_at:      string | null
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
        const { data: closureData } = await supabase
          .from('week_closures')
          .select('id, week_number, start_date, end_date, total_income, total_expenses, net_profit, closed_at')
          .eq('year', parseInt(year))
          .eq('month', parseInt(month))
          .order('week_number')

        const closureRows = closureData ?? []
        const monthStart = `${year}-${String(parseInt(month)).padStart(2, '0')}-01`
        const monthEnd   = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
        const { data: txData } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

        const txs = txData ?? []
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

  const getStatus = (row: ClosureRow): 'closed' | 'open' => row.closed_at ? 'closed' : 'open'

  const closed  = closures.filter(r => getStatus(r) === 'closed')
  const open    = closures.filter(r => getStatus(r) === 'open')
  const totalClosedIncome   = closed.reduce((s, r) => s + r.total_income, 0)
  const totalClosedExpenses = closed.reduce((s, r) => s + r.total_expenses, 0)
  const totalClosedProfit   = totalClosedIncome - totalClosedExpenses
  const avgWeeklyProfit     = closed.length > 0 ? totalClosedProfit / closed.length : 0

  const fmtRange = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end   + 'T00:00:00')
    const mName = s.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short' })
    return `${mName} ${s.getDate()}-${e.getDate()}`
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
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 h-48 animate-pulse" />
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('weeklyPerformance')}</h3>
        <InfoTooltip title={t('weeklyPerfInfoTitle')} description={t('weeklyPerfInfoDesc')} />
      </div>

      {/* Summary Cards — same style as AnnualPerformance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400', badgeColor: 'text-green-600 dark:text-green-400',
            badge: closures.length > 0 ? `${((closed.length / closures.length) * 100).toFixed(0)}%` : '0%',
            label: t('closedWeeks'), value: String(closed.length) },
          { icon: Clock, bg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600 dark:text-yellow-400', badgeColor: 'text-yellow-600 dark:text-yellow-400',
            badge: open.length > 0 ? t('pending') : t('upToDate'),
            label: t('pendingWeeks'), value: String(open.length) },
          { icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400', badgeColor: 'text-green-600 dark:text-green-400',
            badge: t('closed'),
            label: t('closedIncome'), value: formatCurrency(totalClosedIncome) },
          { icon: TrendingUp, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400', badgeColor: 'text-blue-600 dark:text-blue-400',
            badge: t('average'),
            label: t('avgWeeklyProfit'), value: formatCurrency(avgWeeklyProfit) },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className={`${card.bg} p-3 sm:p-4 rounded-lg`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                <span className={`text-xs font-medium ${card.badgeColor}`}>{card.badge}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('weeklyClosureSubtitle')}</p>
          <div className="w-full mb-6" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-25} textAnchor="end" interval={0} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={v => v === 0 ? '$0' : Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos"  fill="#10b981" radius={[3,3,0,0]} name={t('income')} animationDuration={1200} />
                <Bar dataKey="gastos"    fill="#ef4444" radius={[3,3,0,0]} name={t('expenses')} animationDuration={1200} animationBegin={200} />
                <Bar dataKey="beneficio" fill="#60a5fa" radius={[3,3,0,0]} name={t('profit')} animationDuration={1200} animationBegin={400} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-5 mb-6">
            {[{ color: '#10b981', label: t('income') }, { color: '#ef4444', label: t('expenses') }, { color: '#60a5fa', label: t('profit') }].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Table */}
      {closures.length > 0 && (
        <>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('weeklyHistory')}</h4>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full sm:w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[t('week'), t('status'), t('income'), t('expenses'), t('profit')].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                {closures.map(row => {
                  const status = getStatus(row)
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{t('week')} {row.week_number}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status === 'closed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {status === 'closed' ? t('statusClosed') : t('statusOpen')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">{formatCurrency(row.total_income)}</td>
                      <td className="px-3 py-2 text-xs text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">{formatCurrency(row.total_expenses)}</td>
                      <td className={`px-3 py-2 text-xs font-semibold whitespace-nowrap ${row.net_profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {formatCurrency(row.net_profit)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {closures.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('noDataPeriod')}</p>
        </div>
      )}
    </div>
  )
}
