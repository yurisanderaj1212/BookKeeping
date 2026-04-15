'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, CreditCard, TrendingUp, BarChart3 } from 'lucide-react'
import { getSupabase } from '@/lib/supabaseClient'
import { useTranslations, useLocale } from 'next-intl'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { useCurrency } from '@/hooks/useCurrency'

interface ReportsOverviewProps {
  startDate: string | null
  endDate:   string | null
}

interface PeriodData {
  totalIncome:   number
  totalExpenses: number
  netProfit:     number
  profitMargin:  number
}

interface ChartPoint {
  name:      string
  ingresos:  number
  gastos:    number
  beneficio: number
}

export default function ReportsOverview({ startDate, endDate }: ReportsOverviewProps) {
  const t = useTranslations('analytics.components')
  const locale = useLocale()
  const { formatCurrency } = useCurrency()
  const [periodData, setPeriodData] = useState<PeriodData>({ totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 })
  const [chartData, setChartData]   = useState<ChartPoint[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()

        // Determine query range
        const now = new Date()
        const start = startDate ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const end   = endDate   ?? new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        const { data } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', start)
          .lte('date', end)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

        if (cancelled) return
        const rows = data ?? []

        const totalIncome    = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
        const totalExpenses  = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
        const netProfit      = totalIncome - totalExpenses
        const profitMargin   = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
        setPeriodData({ totalIncome, totalExpenses, netProfit, profitMargin })

        // Determine granularity based on range length
        const startD = new Date(start + 'T00:00:00')
        const endD   = new Date(end   + 'T00:00:00')
        const diffDays = Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1

        const dayNames = locale === 'en'
          ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

        const fmtDay = (d: Date) => d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric' })

        let points: ChartPoint[] = []

        if (diffDays <= 14) {
          // Daily view
          for (let i = 0; i < diffDays; i++) {
            const d = new Date(startD)
            d.setDate(startD.getDate() + i)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const dayRows = rows.filter(r => (r.date ?? '').substring(0, 10) === dateStr)
            const ing = dayRows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
            const gas = dayRows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
            points.push({ name: `${dayNames[d.getDay()]} ${d.getDate()}`, ingresos: ing, gastos: gas, beneficio: ing - gas })
          }
        } else if (diffDays <= 92) {
          // Weekly view — group by week
          const weekMap = new Map<string, { ingresos: number; gastos: number; start: Date; end: Date }>()
          for (let i = 0; i < diffDays; i++) {
            const d = new Date(startD)
            d.setDate(startD.getDate() + i)
            const weekStart = new Date(d)
            weekStart.setDate(d.getDate() - d.getDay())
            const key = weekStart.toISOString().split('T')[0]
            if (!weekMap.has(key)) {
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekStart.getDate() + 6)
              weekMap.set(key, { ingresos: 0, gastos: 0, start: weekStart, end: weekEnd })
            }
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const dayRows = rows.filter(r => (r.date ?? '').substring(0, 10) === dateStr)
            const w = weekMap.get(key)!
            w.ingresos += dayRows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
            w.gastos   += dayRows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
          }
          points = Array.from(weekMap.values()).map(v => ({
            name: `${fmtDay(v.start)}-${v.end.getDate()}`,
            ingresos: v.ingresos,
            gastos: v.gastos,
            beneficio: v.ingresos - v.gastos,
          }))
        } else {
          // Monthly view
          const monthMap = new Map<number, { ingresos: number; gastos: number; year: number }>()
          for (const r of rows) {
            const d = new Date(r.date + 'T00:00:00')
            const key = d.getFullYear() * 100 + (d.getMonth() + 1)
            const ex = monthMap.get(key) ?? { ingresos: 0, gastos: 0, year: d.getFullYear() }
            if (r.type === 1) ex.ingresos += r.amount
            else ex.gastos += r.amount
            monthMap.set(key, ex)
          }
          points = Array.from(monthMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([key, v]) => {
              const m = key % 100
              const y = Math.floor(key / 100)
              const label = new Date(y, m - 1, 1).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short', year: '2-digit' })
              return { name: label, ingresos: v.ingresos, gastos: v.gastos, beneficio: v.ingresos - v.gastos }
            })
        }

        if (!cancelled) setChartData(points)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [startDate, endDate, locale])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const income   = payload.find((p: any) => p.dataKey === 'ingresos')?.value  ?? 0
    const expenses = payload.find((p: any) => p.dataKey === 'gastos')?.value    ?? 0
    const profit   = payload.find((p: any) => p.dataKey === 'beneficio')?.value ?? income - expenses
    const isLoss   = profit < 0
    const margin   = income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0'
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <p className="text-sm text-green-600">{t('income')}: {formatCurrency(income)}</p>
        <p className="text-sm text-red-500">{t('expenses')}: {formatCurrency(expenses)}</p>
        <p className="text-sm font-semibold" style={{ color: isLoss ? '#f97316' : '#60a5fa' }}>
          {isLoss ? t('loss') : t('profit')}: {formatCurrency(Math.abs(profit))}
        </p>
        <p className={`text-xs mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 ${isLoss ? 'text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {t('margin')}: <span className="font-semibold">{Math.abs(parseFloat(margin)).toFixed(1)}%</span>
        </p>
      </div>
    )
  }

  const cards = [
    { label: t('totalIncome'),   value: periodData.totalIncome,   icon: DollarSign, bg: 'bg-green-50 dark:bg-green-900/20',   iconColor: 'text-green-600 dark:text-green-400'   },
    { label: t('totalExpenses'), value: periodData.totalExpenses, icon: CreditCard, bg: 'bg-red-50 dark:bg-red-900/20',       iconColor: 'text-red-600 dark:text-red-400'       },
    { label: t('profit'),        value: periodData.netProfit,     icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/20',     iconColor: 'text-blue-600 dark:text-blue-400'     },
    { label: t('margin'),        value: null,                     icon: BarChart3,  bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400', pct: periodData.profitMargin },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('incomeVsExpenses')}</h3>
            <InfoTooltip title={t('infoTitle')} description={t('infoDesc')} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('comparisonDaily')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className={`${c.bg} p-3 sm:p-4 rounded-lg`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
                <span className={`text-xs font-medium ${c.iconColor}`}>{c.label}</span>
              </div>
              {loading ? (
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {c.pct !== undefined ? `${c.pct.toFixed(1)}%` : formatCurrency(c.value ?? 0)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-56 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
          <div className="text-gray-400 text-sm">{t('loadingData')}</div>
        </div>
      ) : (
        <>
          <div className="w-full mb-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={56}
                  tickFormatter={(v) => {
                    if (v === 0) return '$0'
                    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`
                    return `${v}`
                  }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos"  fill="#10b981" radius={[3, 3, 0, 0]} name={t('income')}   animationDuration={1200} />
                <Bar dataKey="gastos"    fill="#ef4444" radius={[3, 3, 0, 0]} name={t('expenses')} animationDuration={1200} animationBegin={200} />
                <Bar dataKey="beneficio" radius={[3, 3, 0, 0]} name={t('profit')} animationDuration={1200} animationBegin={400}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.beneficio >= 0 ? '#60a5fa' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
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
        </>
      )}

      {/* Detail Table */}
      {!loading && chartData.length > 0 && (
        <>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('dailyBreakdown')}</h4>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full sm:w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[t('period'), t('income'), t('expenses'), t('profit')].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-700">
                {chartData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{row.name}</td>
                    <td className="px-3 py-2 text-xs text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">{formatCurrency(row.ingresos)}</td>
                    <td className="px-3 py-2 text-xs text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">{formatCurrency(row.gastos)}</td>
                    <td className={`px-3 py-2 text-xs font-semibold whitespace-nowrap ${row.beneficio >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {formatCurrency(row.beneficio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && chartData.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('noDataPeriod')}</p>
        </div>
      )}
    </div>
  )
}
