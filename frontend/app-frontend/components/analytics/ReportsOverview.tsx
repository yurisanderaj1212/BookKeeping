'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, CreditCard, TrendingUp, BarChart3 } from 'lucide-react'
import { getSupabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/services/reportService'
import { useTranslations, useLocale } from 'next-intl'

interface ReportsOverviewProps {
  period: string
  year: string
  month: string
}

interface PeriodData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

interface ChartPoint {
  name: string
  ingresos: number
  gastos: number
}

function getPeriodDates(period: string, year: string, month: string): { start: string; end: string } {
  const now = new Date()
  if (period === 'week') {
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
  }
  if (period === 'month') {
    const m = parseInt(month)
    const y = parseInt(year)
    return {
      start: `${y}-${String(m).padStart(2, '0')}-01`,
      end: new Date(y, m, 0).toISOString().split('T')[0],
    }
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

export default function ReportsOverview({ period, year, month }: ReportsOverviewProps) {
  const t = useTranslations('analytics.components')
  const locale = useLocale()
  const [periodData, setPeriodData] = useState<PeriodData>({ totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 })
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { start, end } = getPeriodDates(period, year, month)

        // Fetch all transactions for the period
        const { data } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .gte('date', start)
          .lte('date', end)

        if (cancelled) return
        const rows = data ?? []

        const totalIncome = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
        const totalExpenses = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
        const netProfit = totalIncome - totalExpenses
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

        setPeriodData({ totalIncome, totalExpenses, netProfit, profitMargin })

        // Build chart data
        if (period === 'week') {
          // 7 days
          const points: ChartPoint[] = []
          const startDate = new Date(start)
          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate)
            d.setDate(startDate.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            const dayRows = rows.filter(r => r.date === dateStr)
            points.push({
              name: d.toLocaleDateString(locale, { weekday: 'short' }),
              ingresos: dayRows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0),
              gastos: dayRows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0),
            })
          }
          setChartData(points)
        } else if (period === 'month') {
          // Group by Sunday-based week within the month
          const weekMap = new Map<number, { ingresos: number; gastos: number }>()
          for (const r of rows) {
            const d = new Date(r.date + 'T00:00:00')
            // Find which week slot (1-5) this day belongs to
            // Week 1 starts on the Sunday on or before the 1st of the month
            const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
            const firstSunday  = new Date(firstOfMonth)
            firstSunday.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())
            const diffDays = Math.floor((d.getTime() - firstSunday.getTime()) / (86400000))
            const weekNum  = Math.floor(diffDays / 7) + 1
            const existing = weekMap.get(weekNum) ?? { ingresos: 0, gastos: 0 }
            if (r.type === 1) existing.ingresos += r.amount
            else existing.gastos += r.amount
            weekMap.set(weekNum, existing)
          }
          const points: ChartPoint[] = Array.from({ length: 5 }, (_, i) => {
            const w = weekMap.get(i + 1) ?? { ingresos: 0, gastos: 0 }
            return { name: `${t('week')} ${i + 1}`, ...w }
          })
          setChartData(points)
        } else {
          // year — group by month
          const monthMap = new Map<number, { ingresos: number; gastos: number }>()
          for (const r of rows) {
            const m = new Date(r.date).getMonth() + 1
            const existing = monthMap.get(m) ?? { ingresos: 0, gastos: 0 }
            if (r.type === 1) existing.ingresos += r.amount
            else existing.gastos += r.amount
            monthMap.set(m, existing)
          }
          const points: ChartPoint[] = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1
            const w = monthMap.get(m) ?? { ingresos: 0, gastos: 0 }
            return {
              name: new Date(parseInt(year), i, 1).toLocaleDateString(locale, { month: 'short' }),
              ...w,
            }
          })
          setChartData(points)
        }
      } catch {
        // silencioso
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [period, year, month])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'ingresos' ? t('income') : t('expenses')}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  const cards = [
    { label: t('totalIncome'),   value: periodData.totalIncome,   icon: DollarSign, bg: 'bg-green-100',  iconColor: 'text-green-600'  },
    { label: t('totalExpenses'), value: periodData.totalExpenses, icon: CreditCard, bg: 'bg-red-100',    iconColor: 'text-red-600'    },
    { label: t('profit'),        value: periodData.netProfit,     icon: TrendingUp, bg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
    { label: t('margin'),        value: null,                     icon: BarChart3,  bg: 'bg-purple-100', iconColor: 'text-purple-600', pct: periodData.profitMargin },
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`${c.bg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
              {loading ? (
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
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
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('incomeVsExpenses')}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {period === 'week' ? t('comparisonDaily') : period === 'month' ? t('comparisonWeekly') : t('comparisonMonthly')}
          </p>
        </div>
        {loading ? (
          <div className="h-56 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-sm">{t('loadingData')}</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="20%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={56}
                tickFormatter={(v) => {
                  if (v === 0) return '$0'
                  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`
                  return `$${v}`
                }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
