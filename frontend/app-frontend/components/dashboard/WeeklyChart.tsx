'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { WeeklyData } from '../../data/dashboard-data'
import { MoreHorizontal } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface WeeklyChartProps {
  data: WeeklyData[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const t = useTranslations('dashboard.weeklyChart')
  const locale = useLocale()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  const formatYAxis = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return `${v}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white p-2.5 border border-gray-200 rounded-lg shadow-lg text-xs">
        <p className="font-semibold text-gray-900 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => {
          const value = entry.dataKey === 'profit' ? entry.payload.profitReal : entry.value
          const name = entry.dataKey === 'income' ? t('income')
            : entry.dataKey === 'expenses' ? t('expenses')
            : value >= 0 ? t('profit') : t('loss')
          return (
            <p key={index} style={{ color: entry.color }}>
              {name}: {formatCurrency(value)}
            </p>
          )
        })}
      </div>
    )
  }

  const chartData = data.slice(-5).map((week, index) => {
    const profit = week.income - week.expenses
    return {
      name:       t('weekLabel', { n: String(index + 1) }),
      income:     week.income,
      expenses:   week.expenses,
      profit:     profit > 0 ? profit : 0,
      profitReal: profit,
    }
  })

  // Responsive config
  const chartHeight  = isMobile ? 220 : 280
  const margin       = isMobile
    ? { top: 8, right: 8, left: -10, bottom: 0 }
    : { top: 16, right: 20, left: 0, bottom: 0 }
  const tickFontSize = isMobile ? 10 : 12
  const barGap       = isMobile ? 2 : 4
  const barCatGap    = isMobile ? '15%' : '25%'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            <span className="text-primary-600 mr-1">
              {new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
            </span>
            {t('title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
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
            width={isMobile ? 32 : 40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend
            wrapperStyle={{ paddingTop: isMobile ? '10px' : '16px', fontSize: isMobile ? 11 : 12 }}
            iconType="circle"
            iconSize={isMobile ? 8 : 10}
          />
          <Bar dataKey="income"   name={t('income')}   fill="#20B2AA" radius={[3,3,0,0]} animationDuration={800} />
          <Bar dataKey="expenses" name={t('expenses')} fill="#FF6B6B" radius={[3,3,0,0]} animationDuration={800} animationBegin={150} />
          <Bar dataKey="profit"   name={t('profit')}   fill="#60a5fa" radius={[3,3,0,0]} animationDuration={800} animationBegin={300} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
