'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { MonthlyData } from '../../data/dashboard-data'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'

interface MonthlyChartProps {
  data: MonthlyData[]
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const t = useTranslations('dashboard.monthlyChart')
  const locale = useLocale()
  const { formatCurrency } = useCurrency()
  const [isMobile, setIsMobile] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const obs = new MutationObserver(checkDark)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const formatYAxis = (v: number) => {
    const abs = Math.abs(v)
    if (abs >= 1000) return `${v < 0 ? '-' : ''}${(abs / 1000).toFixed(0)}k`
    return `${v}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const incomeEntry = payload.find((e: any) => e.dataKey === 'income')
    const profitEntry = payload.find((e: any) => e.dataKey === 'profit')
    const incomeVal   = incomeEntry?.value ?? 0
    const profitVal   = profitEntry?.value ?? 0
    const profitMargin = incomeVal > 0 && profitVal > 0
      ? ((profitVal / incomeVal) * 100).toFixed(1)
      : null

    return (
      <div className="bg-white dark:bg-gray-800 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isLoss  = entry.dataKey === 'profit' && entry.value < 0
          const name    = entry.dataKey === 'income'   ? t('income')
            : entry.dataKey === 'expenses' ? t('expenses')
            : isLoss ? t('loss') : t('profit')
          const color   = entry.dataKey === 'profit'
            ? (isLoss ? '#f97316' : '#60a5fa')
            : entry.color
          return (
            <p key={index} style={{ color }}>
              {name}: {formatCurrency(entry.value)}
              {entry.dataKey === 'profit' && profitMargin && (
                <span style={{ marginLeft: 4, opacity: 0.8 }}>({profitMargin}%)</span>
              )}
            </p>
          )
        })}
      </div>
    )
  }

  // On mobile show last 4 months to avoid crowding; desktop shows all 6
  const displayData = isMobile ? data.slice(-4) : data

  const chartData = displayData.map((month) => {
    const profit = month.income - month.expenses
    const name = isMobile && month.month.length > 3
      ? month.month.substring(0, 3).toLowerCase()
      : month.month
    return {
      name,
      income:   month.income,
      expenses: month.expenses,
      profit,   // real value — negative shows bar going down
    }
  })

  // Cap negative profit so it doesn't dwarf positive bars
  const maxPositive = Math.max(...chartData.map(d => Math.max(d.income, d.expenses, 0)), 1)
  const minNegative = -maxPositive * 0.25

  // Responsive config
  const chartHeight  = isMobile ? 220 : 280
  const margin       = isMobile
    ? { top: 8, right: 8, left: 0, bottom: 0 }
    : { top: 16, right: 20, left: 0, bottom: 0 }
  const tickFontSize = isMobile ? 10 : 12
  const yAxisWidth   = isMobile ? 42 : 48
  const barGap       = isMobile ? 2 : 4
  const barCatGap    = isMobile ? '15%' : '25%'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span className="text-primary-600 mr-1">{new Date().getFullYear()}</span>
            {t('title')}
            <InfoTooltip title={t('infoTitle')} description={t('infoDesc')} className="ml-1.5" />
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={margin}
          barCategoryGap={barCatGap}
          barGap={barGap}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: tickFontSize, fill: '#6b7280' }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: tickFontSize, fill: '#6b7280' }}
            tickFormatter={formatYAxis}
            width={yAxisWidth}
            domain={[minNegative, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />
          <Legend
            wrapperStyle={{ paddingTop: isMobile ? '10px' : '16px', fontSize: isMobile ? 11 : 12 }}
            iconType="circle"
            iconSize={isMobile ? 8 : 10}
            content={() => (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: isMobile ? 10 : 16, fontSize: isMobile ? 11 : 12 }}>
                {[
                  { label: t('income'),   color: '#20B2AA' },
                  { label: t('expenses'), color: '#FF6B6B' },
                  { label: t('profit'),   color: '#60a5fa' },
                ].map(item => (
                  <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: isMobile ? 8 : 10, height: isMobile ? 8 : 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span style={{ color: '#4a5568' }}>{item.label}</span>
                  </span>
                ))}
              </div>
            )}
          />
          <Bar dataKey="income"   name={t('income')}   fill="#20B2AA" radius={[3,3,0,0]} animationDuration={1200} />
          <Bar dataKey="expenses" name={t('expenses')} fill="#FF6B6B" radius={[3,3,0,0]} animationDuration={1200} animationBegin={200} />
          <Bar dataKey="profit"   name={t('profit')}   radius={[3,3,0,0]} animationDuration={1200} animationBegin={400} minPointSize={2}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#60a5fa' : '#f97316'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
