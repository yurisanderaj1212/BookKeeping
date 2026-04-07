'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getPeriodDates, fetchTransactions } from '@/lib/analyticsHelpers'

interface CashFlowAnalysisProps {
  period: string
  year:   string
  month:  string
}

export default function CashFlowAnalysis({ period, year, month }: CashFlowAnalysisProps) {
  const t  = useTranslations('analytics.cashFlow')
  const tc = useTranslations('analytics.components')
  const locale = useLocale()
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('weekly')
  const [cashFlowData, setCashFlowData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { start, end } = getPeriodDates(period, year, month)
        const rows = await fetchTransactions(start, end)

        let points: any[] = []

        if (viewType === 'weekly') {
          // Group by week number within the period
          const startDate = new Date(start + 'T00:00:00')
          points = Array.from({ length: 5 }, (_, i) => {
            const weekStart = new Date(startDate); weekStart.setDate(startDate.getDate() + i * 7)
            const weekEnd   = new Date(weekStart);  weekEnd.setDate(weekStart.getDate() + 6)
            const ws = weekStart.toISOString().split('T')[0]
            const we = weekEnd.toISOString().split('T')[0]
            const week = rows.filter(r => r.date >= ws && r.date <= we)
            const ingresos = week.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
            const gastos   = week.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
            return { name: `${tc('week')} ${i+1}`, ingresos, gastos, flujoNeto: ingresos - gastos }
          }).filter(p => p.ingresos > 0 || p.gastos > 0 || p.name === `${tc('week')} 1`)
        } else {
          // Daily — last 7 days
          points = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - 6 + i)
            const dateStr = d.toISOString().split('T')[0]
            const day = rows.filter(r => r.date === dateStr)
            const ingresos = day.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
            const gastos   = day.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
            return { name: d.toLocaleDateString(locale, { weekday: 'short' }), ingresos, gastos, flujoNeto: ingresos - gastos }
          })
        }

        // Add cumulative
        let accum = 0
        points = points.map(p => { accum += p.flujoNeto; return { ...p, acumulado: accum } })

        if (!cancelled) setCashFlowData(points)
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [period, year, month, viewType, locale])

  const totalInflow  = cashFlowData.reduce((s, p) => s + p.ingresos, 0)
  const totalOutflow = cashFlowData.reduce((s, p) => s + p.gastos, 0)
  const netCashFlow  = totalInflow - totalOutflow
  const finalBalance = cashFlowData[cashFlowData.length - 1]?.acumulado ?? 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'flujoNeto' ? t('tooltipNet') : t('tooltipAccum')}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  const summaryData = [
    { concepto: t('conceptInflow'),  monto: totalInflow,  porcentaje: 100, tipo: 'income' as const },
    { concepto: t('conceptOutflow'), monto: totalOutflow, porcentaje: totalInflow > 0 ? (totalOutflow / totalInflow) * 100 : 0, tipo: 'expense' as const },
    { concepto: t('conceptNet'),     monto: netCashFlow,  porcentaje: totalInflow > 0 ? (netCashFlow / totalInflow) * 100 : 0, tipo: netCashFlow >= 0 ? 'income' as const : 'expense' as const },
  ]

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewType === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('btnDaily')}
              </button>
              <button
                onClick={() => setViewType('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewType === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('btnWeekly')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">{t('cardInflow')}</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-green-700">{formatCurrency(totalInflow)}</p>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">{t('cardOutflow')}</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-red-700">{formatCurrency(totalOutflow)}</p>
          </div>
          <div className={`${netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-3 sm:p-4 rounded-lg`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className={`w-4 h-4 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className={`text-xs font-medium ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {t('cardNet')}
              </span>
            </div>
            <p className={`text-base sm:text-xl font-bold ${netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(netCashFlow)}
            </p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">{t('cardFinalBalance')}</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-purple-700">{formatCurrency(finalBalance)}</p>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="w-full" style={{ height: isMobile ? 220 : 280 }}>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
            {viewType === 'daily' ? t('chartTitleDaily') : t('chartTitleWeekly')}
          </h4>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-400">{t('loading')}</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
              <LineChart
                data={cashFlowData}
                margin={isMobile
                  ? { top: 8, right: 8, left: -10, bottom: 0 }
                  : { top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
                  width={isMobile ? 32 : undefined}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="flujoNeto" stroke="#60a5fa" strokeWidth={3}
                  dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }} name={t('tooltipNet')} />
                <Line type="monotone" dataKey="acumulado" stroke="#8b5cf6" strokeWidth={2}
                  strokeDasharray="5 5" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }} name={t('tooltipAccum')} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cash Flow Summary Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('summaryTitle')}</h4>
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-[40%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('colConcept')}
                </th>
                <th className="w-[25%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('colAmount')}
                </th>
                <th className="w-[20%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('colPercent')}
                </th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('colImpact')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {summaryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.tipo === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-gray-900">{item.concepto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-bold ${item.tipo === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                      {item.tipo === 'income' ? '+' : item.monto < 0 ? '' : '-'}{formatCurrency(Math.abs(item.monto))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700">{Math.abs(item.porcentaje).toFixed(1)}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.tipo === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.tipo === 'income' ? t('impactPositive') : t('impactNegative')}
                    </div>
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
