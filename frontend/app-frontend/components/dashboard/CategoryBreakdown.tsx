'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
  icon?: string
  type?: number  // 1=income, 2=expense
}

interface CategoryBreakdownProps {
  categories: CategoryData[]
}

const INCOME_COLORS  = ['#10b981','#059669','#34d399','#6ee7b7','#a7f3d0','#d1fae5']
const EXPENSE_COLORS = ['#ef4444','#dc2626','#f97316','#f59e0b','#8b5cf6','#ec4899']

const CustomTooltip = ({ active, payload, formatCurrency }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
      <p className="font-medium text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">{formatCurrency(d.value)} · {d.percentage}%</p>
    </div>
  )
}

interface ChartCardProps {
  title: string
  data: CategoryData[]
  emptyText: string
  emptyDesc: string
  formatCurrency: (n: number) => string
}

function ChartCard({ title, data, emptyText, emptyDesc, formatCurrency }: ChartCardProps) {
  const chartData = data.map(c => ({
    name: c.name, value: c.amount, percentage: c.percentage, color: c.color,
  }))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 flex-1 min-w-0">
      {/* Title — large, top left, no subtitle */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PieIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-xs">{emptyText}</p>
            <p className="text-gray-400 text-xs mt-0.5">{emptyDesc}</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                outerRadius={70} innerRadius={32}
                dataKey="value"
                animationBegin={0} animationDuration={800}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-1.5">
            {data.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                </div>
                <div className="shrink-0 ml-3 text-right">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(cat.amount)}</span>
                  <span className="text-xs text-gray-400 ml-1">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const t    = useTranslations('dashboard.categoryBreakdown')
  const tCat = useTranslations('categories')
  const locale = useLocale()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency', currency: 'USD',
    }).format(amount)

  const translateCategory = (name: string): string => {
    const MAP: Record<string, string> = {
      'Supply': 'supply', 'Service': 'service', 'Transport': 'transport',
      'Payroll': 'payroll', 'Marketing': 'marketing', 'Other': 'other',
    }
    const key = MAP[name]
    if (!key) return name
    try { return tCat(key as any) } catch { return name }
  }

  const incomeList = categories
    .filter(c => c.type === 1 || c.type === undefined)
    .map((c, i) => ({ ...c, name: translateCategory(c.name), color: INCOME_COLORS[i % INCOME_COLORS.length] }))

  const expenseList = categories
    .filter(c => c.type === 2)
    .map((c, i) => ({ ...c, name: translateCategory(c.name), color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }))

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      <ChartCard
        title={t('titleIncome')}
        data={incomeList}
        emptyText={t('empty')}
        emptyDesc={t('emptyDesc')}
        formatCurrency={formatCurrency}
      />
      <ChartCard
        title={t('titleExpense')}
        data={expenseList}
        emptyText={t('empty')}
        emptyDesc={t('emptyDesc')}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
