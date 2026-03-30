'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getPeriodDates, fetchTransactions } from '@/lib/analyticsHelpers'

interface PerformanceMetricsProps {
  period: string
  year:   string
  month:  string
}

export default function PerformanceMetrics({ period, year, month }: PerformanceMetricsProps) {
  const t      = useTranslations('analytics.components')
  const locale = useLocale()
  const [rows, setRows]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { start, end } = getPeriodDates(period, year, month)
        const data = await fetchTransactions(start, end)
        if (!cancelled) setRows(data)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [period, year, month])

  const totalIncome   = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
  const totalExpenses = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
  const netProfit     = totalIncome - totalExpenses
  const profitMargin  = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  const pendingCount  = rows.filter(r => r.status === 1).length
  const completionRate = rows.length > 0 ? (rows.filter(r => r.status === 0).length / rows.length) * 100 : 0

  const incomeRows  = rows.filter(r => r.type === 1)
  const expenseRows = rows.filter(r => r.type === 2)
  const avgIncome   = incomeRows.length  > 0 ? incomeRows.reduce((s, r)  => s + r.amount, 0) / incomeRows.length  : 0
  const avgExpense  = expenseRows.length > 0 ? expenseRows.reduce((s, r) => s + r.amount, 0) / expenseRows.length : 0
  const maxIncome   = incomeRows.length  > 0 ? Math.max(...incomeRows.map(r => r.amount))  : 0
  const maxExpense  = expenseRows.length > 0 ? Math.max(...expenseRows.map(r => r.amount)) : 0
  const minIncome   = incomeRows.length  > 0 ? Math.min(...incomeRows.map(r => r.amount))  : 0
  const minExpense  = expenseRows.length > 0 ? Math.min(...expenseRows.map(r => r.amount)) : 0

  const performanceData = [
    { metric: t('profitMarginKpi'), value: profitMargin,   target: 25,  unit: '%',
      status: profitMargin  >= 25 ? 'excellent' : profitMargin  >= 15 ? 'good' : profitMargin  >= 5 ? 'warning' : 'poor' },
    { metric: t('completionRate'),  value: completionRate, target: 95,  unit: '%',
      status: completionRate >= 95 ? 'excellent' : completionRate >= 85 ? 'good' : completionRate >= 70 ? 'warning' : 'poor' },
    { metric: t('costEfficiency'),  value: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0, target: 80, unit: '%',
      status: totalIncome > 0 && ((totalIncome - totalExpenses) / totalIncome) * 100 >= 80 ? 'excellent' : 'warning' },
    { metric: t('avgRoi'),          value: totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0, target: 150, unit: '%',
      status: totalExpenses > 0 && (netProfit / totalExpenses) * 100 >= 150 ? 'excellent' : totalExpenses > 0 && (netProfit / totalExpenses) * 100 >= 100 ? 'good' : 'warning' },
  ]

  const transactionMetrics = [
    { name: t('avgValue'), ingresos: avgIncome,  gastos: avgExpense },
    { name: t('maxValue'), ingresos: maxIncome,  gastos: maxExpense },
    { name: t('minValue'), ingresos: minIncome,  gastos: minExpense },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good':      return 'text-blue-600 bg-blue-100'
      case 'warning':   return 'text-yellow-600 bg-yellow-100'
      default:          return 'text-red-600 bg-red-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />
      case 'good':      return <TrendingUp className="w-4 h-4" />
      case 'warning':   return <AlertCircle className="w-4 h-4" />
      default:          return <TrendingDown className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('performanceTitle')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('performanceSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Target className="w-4 h-4" />
            <span>{t('kpiObjectives')}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceData.map((metric, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">{metric.metric}</h4>
                  <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('actual')}</span>
                    <span className="text-lg font-bold text-gray-900">{metric.value.toFixed(1)}{metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('target')}</span>
                    <span className="text-sm text-gray-600">{metric.target}{metric.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${
                      metric.status === 'excellent' ? 'bg-green-500' : metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Analysis + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">{t('transactionAnalysis')}</h4>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-sm">{t('loading')}</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={transactionMetrics} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4,4,0,0]} name={t('income')} />
                <Bar dataKey="gastos"   fill="#ef4444" radius={[4,4,0,0]} name={t('expenses')} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">{t('performanceSummary')}</h4>
          <div className="space-y-4">
            <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('overallScore')}</span>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-lg font-bold text-blue-700">
                    {((performanceData.reduce((s, m) => s + Math.min(m.value / m.target, 1), 0) / performanceData.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((performanceData.reduce((s, m) => s + Math.min(m.value / m.target, 1), 0) / performanceData.length) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">{t('keyInsights')}</h5>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">{t('positiveProfit')}</p>
                  <p className="text-xs text-green-600">{t('generatingProfit', { amount: formatCurrency(netProfit) })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{t('activeTransactions')}</p>
                  <p className="text-xs text-blue-600">{t('transactionsProcessed', { count: String(rows.length) })}</p>
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{t('pendingTransactionsAlert')}</p>
                    <p className="text-xs text-yellow-600">{t('pendingRequireAttention', { count: String(pendingCount) })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
