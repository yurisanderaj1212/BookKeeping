'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'
import { getSupabase } from '@/lib/supabaseClient'

interface PeriodComparisonProps {
  period: string
  year:   string
  month:  string
}

interface PeriodData {
  ingresos:      number
  gastos:        number
  beneficio:     number
  transacciones: number
}

async function fetchPeriodData(start: string, end: string): Promise<PeriodData> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('transactions')
    .select('type, amount, status')
    .gte('date', start).lte('date', end)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
  const rows = data ?? []
  return {
    ingresos:      rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0),
    gastos:        rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0),
    beneficio:     rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0) - rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0),
    transacciones: rows.length,
  }
}

function shiftPeriod(period: string, year: string, month: string): { start: string; end: string } {
  const y = parseInt(year), m = parseInt(month)
  if (period === 'month') {
    const prev = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }
    return { start: `${prev.y}-${String(prev.m).padStart(2,'0')}-01`, end: new Date(prev.y, prev.m, 0).toISOString().split('T')[0] }
  }
  if (period === 'year') {
    return { start: `${y-1}-01-01`, end: `${y-1}-12-31` }
  }
  // week — previous week
  const now = new Date()
  const day = now.getDay()
  const thisStart = new Date(now); thisStart.setDate(now.getDate() - day - 7)
  const thisEnd   = new Date(thisStart); thisEnd.setDate(thisStart.getDate() + 6)
  return { start: thisStart.toISOString().split('T')[0], end: thisEnd.toISOString().split('T')[0] }
}

function getCurrentPeriod(period: string, year: string, month: string): { start: string; end: string } {
  const y = parseInt(year), m = parseInt(month)
  if (period === 'month') {
    return { start: `${y}-${String(m).padStart(2,'0')}-01`, end: new Date(y, m, 0).toISOString().split('T')[0] }
  }
  if (period === 'year') return { start: `${y}-01-01`, end: `${y}-12-31` }
  const now = new Date(); const day = now.getDay()
  const start = new Date(now); start.setDate(now.getDate() - day)
  const end   = new Date(start); end.setDate(start.getDate() + 6)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

export default function PeriodComparison({ period, year, month }: PeriodComparisonProps) {
  const t      = useTranslations('analytics.components')
  const locale = useLocale()
  const { formatCurrency } = useCurrency()
  const [current,  setCurrent]  = useState<PeriodData | null>(null)
  const [previous, setPrevious] = useState<PeriodData | null>(null)
  const [loading,  setLoading]  = useState(true)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const curr = getCurrentPeriod(period, year, month)
        const prev = shiftPeriod(period, year, month)
        const [c, p] = await Promise.all([fetchPeriodData(curr.start, curr.end), fetchPeriodData(prev.start, prev.end)])
        if (!cancelled) { setCurrent(c); setPrevious(p) }
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [period, year, month])

  const getPeriodLabel = () => {
    if (period === 'month')   return t('periodMonth')
    if (period === 'year')    return t('periodYear')
    return t('periodDefault')
  }

  const calcChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100

  const chartData = current && previous ? [
    { period: t('currentLabel'),  ingresos: current.ingresos,  gastos: current.gastos,  beneficio: current.beneficio },
    { period: t('previousLabel'), ingresos: previous.ingresos, gastos: previous.gastos, beneficio: previous.beneficio },
  ] : []

  const metrics = current && previous ? [
    { title: t('income'),           actual: current.ingresos,      anterior: previous.ingresos,      cambio: calcChange(current.ingresos, previous.ingresos) },
    { title: t('expenses'),         actual: current.gastos,        anterior: previous.gastos,        cambio: calcChange(current.gastos, previous.gastos) },
    { title: t('profit'),           actual: current.beneficio,     anterior: previous.beneficio,     cambio: calcChange(current.beneficio, previous.beneficio) },
    { title: t('transactionsLabel'),actual: current.transacciones, anterior: previous.transacciones, cambio: calcChange(current.transacciones, previous.transacciones), isCount: true },
  ] : []

  const ComparisonCard = ({ title, actual, anterior, cambio, isCount = false }: any) => {
    const isPositive = cambio >= 0
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    const bgClass    = isPositive ? 'bg-green-100'   : 'bg-red-100'
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h4>
          <div className={`${bgClass} p-1 rounded-full`}><Icon className={`w-4 h-4 ${colorClass}`} /></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('currentLabel')}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{isCount ? actual : formatCurrency(actual)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('previousLabel')}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{isCount ? anterior : formatCurrency(anterior)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('changeLabel')}</span>
            <span className={`text-sm font-medium ${colorClass}`}>{isPositive ? '+' : ''}{cambio.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('periodComparison')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('comparisonWithPrev', { period: getPeriodLabel() })}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, i) => <ComparisonCard key={i} {...m} />)}
        </div>
      )}

      <div className="w-full">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">{t('visualComparison')}</h4>
        {loading ? (
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">{t('loading')}</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="ingresos"  fill="#10b981" radius={[4,4,0,0]} name={t('income')} />
              <Bar dataKey="gastos"    fill="#ef4444" radius={[4,4,0,0]} name={t('expenses')} />
              <Bar dataKey="beneficio" fill="#60a5fa" radius={[4,4,0,0]} name={t('profit')} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}


