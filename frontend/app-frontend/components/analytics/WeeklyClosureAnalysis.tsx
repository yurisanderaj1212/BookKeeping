'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getSupabase } from '@/lib/supabaseClient'

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
  const [closures, setClosures] = useState<ClosureRow[]>([])
  const [loading, setLoading]   = useState(true)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('week_closures')
          .select('id, week_number, start_date, end_date, total_income, total_expenses, net_profit, closed_at')
          .eq('year', parseInt(year))
          .eq('month', parseInt(month))
          .order('week_number')
        if (!cancelled) setClosures(data ?? [])
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

  const chartData = closures.map(r => ({
    name:      `S${r.week_number}`,
    fullName:  `${t('week')} ${r.week_number}`,
    ingresos:  r.total_income,
    gastos:    r.total_expenses,
    beneficio: r.net_profit,
    status:    getStatus(r),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{d?.fullName}</p>
        <p className="text-xs text-gray-500 mb-1">{t('status')}: {d?.status === 'closed' ? t('statusClosed') : t('statusOpen')}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'ingresos' ? t('income') : entry.dataKey === 'gastos' ? t('expenses') : t('profit')}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle, bg: 'bg-green-100', iconColor: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-600',
            badge: closures.length > 0 ? `${((closed.length / closures.length) * 100).toFixed(0)}%` : '0%',
            label: t('closedWeeks'), value: closed.length },
          { icon: Clock, bg: 'bg-yellow-100', iconColor: 'text-yellow-600', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-600',
            badge: open.length > 0 ? t('pending') : t('upToDate'),
            label: t('pendingWeeks'), value: open.length },
          { icon: TrendingUp, bg: 'bg-blue-100', iconColor: 'text-blue-600', badgeBg: 'bg-green-100', badgeText: 'text-green-600',
            badge: t('closed'),
            label: t('closedIncome'), value: formatCurrency(totalClosedIncome), isCurrency: true },
          { icon: TrendingUp, bg: 'bg-purple-100', iconColor: 'text-purple-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-600',
            badge: t('average'),
            label: t('avgWeeklyProfit'), value: formatCurrency(avgWeeklyProfit), isCurrency: true },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.bg} p-2 rounded-lg`}><Icon className={`w-5 h-5 ${card.iconColor}`} /></div>
                <div className={`${card.badgeBg} px-2 py-1 rounded text-xs font-medium ${card.badgeText}`}>{card.badge}</div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{card.isCurrency ? card.value : card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('weeklyPerformance')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('weeklyClosureSubtitle')}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="gastos"    fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="beneficio" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {closures.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('weeklyHistory')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('weeklyHistorySubtitle')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {['Semana', t('status'), t('income'), t('expenses'), t('profit')].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {closures.map(row => {
                  const status = getStatus(row)
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{t('week')} {row.week_number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status === 'closed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {status === 'closed' ? t('statusClosed') : t('statusOpen')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{formatCurrency(row.total_income)}</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(row.total_expenses)}</td>
                      <td className={`px-4 py-3 font-semibold ${row.net_profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
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
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noDataPeriod')}</p>
        </div>
      )}
    </div>
  )
}
