'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MonthlyData } from '../../data/dashboard-data'
import { MoreHorizontal } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface MonthlyChartProps {
  data: MonthlyData[]
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const t = useTranslations('dashboard.monthlyChart')
  const locale = useLocale()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const value = entry.dataKey === 'profit' ? entry.payload.profitReal : entry.value
          const name = entry.dataKey === 'income' ? t('income')
            : entry.dataKey === 'expenses' ? t('expenses')
            : value >= 0 ? t('profit') : t('loss')
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {name}: {formatCurrency(value)}
            </p>
          )
        })}
      </div>
    )
  }

  const chartData = data.map((month) => {
    const profit = month.income - month.expenses
    return {
      name:       month.month,
      income:     month.income,
      expenses:   month.expenses,
      profit:     profit > 0 ? profit : 0,
      profitReal: profit,
    }
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
            <Bar dataKey="income"   name={t('income')}   fill="#20B2AA" radius={[4,4,0,0]} animationDuration={1500} />
            <Bar dataKey="expenses" name={t('expenses')} fill="#FF6B6B" radius={[4,4,0,0]} animationDuration={1500} animationBegin={300} />
            <Bar dataKey="profit"   name={t('profit')}   fill="#4ECDC4" radius={[4,4,0,0]} animationDuration={1500} animationBegin={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
