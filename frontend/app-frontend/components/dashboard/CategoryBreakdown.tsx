'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

const INCOME_COLORS = ['#10b981','#059669','#34d399','#6ee7b7','#a7f3d0','#d1fae5']
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

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.categoryBreakdown')
  const tCat = useTranslations('categories')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = document.getElementById('cat-chart-container')
    if (!el) return
    const obs = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    obs.observe(el)
    setContainerWidth(el.offsetWidth)
    return () => obs.disconnect()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency', currency: 'USD',
    }).format(amount)

  // Translate category name from Spanish DB name to i18n
  const translateCategory = (name: string): string => {
    const MAP: Record<string, string> = {
      'Ventas': 'income-sales', 'Servicios': 'income-services',
      'Consultoría': 'income-consulting', 'Inversiones': 'income-investments',
      'Otros Ingresos': 'income-other', 'Oficina': 'expense-office-supplies',
      'Marketing': 'expense-marketing', 'Software': 'expense-software',
      'Servicios Públicos': 'expense-utilities', 'Equipos': 'expense-equipment',
      'Viajes': 'expense-travel', 'Servicios Profesionales': 'expense-professional',
      'Alquiler': 'expense-rent', 'Nómina': 'expense-payroll',
      'Otros Gastos': 'expense-other',
    }
    const key = MAP[name]
    if (!key) return name
    try { return tCat(key as any) } catch { return name }
  }

  // Split by type — income=1, expense=2
  const incomeList = categories
    .filter(c => c.type === 1 || c.type === undefined)
    .map((c, i) => ({ ...c, name: translateCategory(c.name), color: INCOME_COLORS[i % INCOME_COLORS.length] }))

  const expenseList = categories
    .filter(c => c.type === 2)
    .map((c, i) => ({ ...c, name: translateCategory(c.name), color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }))

  const displayed = activeTab === 'income' ? incomeList : expenseList
  const chartData = displayed.map(c => ({ name: c.name, value: c.amount, percentage: c.percentage, color: c.color }))

  const tabClass = (tab: 'income' | 'expense') =>
    `px-3 py-1 text-xs font-medium rounded-full transition-colors ${
      activeTab === tab
        ? tab === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        : 'text-gray-500 hover:text-gray-700'
    }`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'income' ? t('titleIncome') : t('titleExpense')}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeTab === 'income' ? t('subtitleIncome') : t('subtitleExpense')}
          </p>
        </div>
        <button
          onClick={() => router.push('/transactions')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>{t('viewAll')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button className={tabClass('income')} onClick={() => setActiveTab('income')}>
          {t('tabIncome')}
        </button>
        <button className={tabClass('expense')} onClick={() => setActiveTab('expense')}>
          {t('tabExpense')}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">{t('empty')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('emptyDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Pie chart */}
          <div id="cat-chart-container" className="w-full" style={{ height: 220 }}>
            {containerWidth > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    outerRadius={80} innerRadius={40}
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
            )}
          </div>

          {/* Category list */}
          <div className="mt-2 space-y-1 overflow-y-auto flex-1">
            {displayed.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-800 truncate">{cat.name}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(cat.amount)}</p>
                  <p className="text-xs text-gray-400">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
