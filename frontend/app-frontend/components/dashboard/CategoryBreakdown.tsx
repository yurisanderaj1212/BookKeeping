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

interface MiniChartProps {
  title: string
  subtitle: string
  data: CategoryData[]
  emptyText: string
  emptyDesc: string
  formatCurrency: (n: number) => string
}

function MiniChart({ title, subtitle, data, emptyText, emptyDesc, formatCurrency }: MiniChartProps) {
  const chartData = data.map(c => ({ name: c.name, value: c.amount, percentage: c.percentage, color: c.color }))

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PieIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-xs">{emptyText}</p>
            <p className="text-gray-400 text-xs mt-0.5">{emptyDesc}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                outerRadius={65} innerRadius={30}
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

          <div className="mt-2 space-y-1">
            {data.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-700 truncate">{cat.name}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                  <span className="text-xs text-gray-400 ml-1">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('title')}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="flex gap-4 sm:gap-6">
        {/* Divider */}
        <MiniChart
          title={t('titleIncome')}
          subtitle={t('subtitleIncome')}
          data={incomeList}
          emptyText={t('empty')}
          emptyDesc={t('emptyDesc')}
          formatCurrency={formatCurrency}
        />
        <div className="w-px bg-gray-100 shrink-0" />
        <MiniChart
          title={t('titleExpense')}
          subtitle={t('subtitleExpense')}
          data={expenseList}
          emptyText={t('empty')}
          emptyDesc={t('emptyDesc')}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  )
}
