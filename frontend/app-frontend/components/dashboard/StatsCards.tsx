'use client'

import { formatPercentage } from '../../data/dashboard-data'
import { TrendingUp, CreditCard, DollarSign, Clock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface StatsCardsProps {
  totalIncome:    number
  totalExpenses:  number
  netProfit:      number
  pending:        number
  incomeChange:   number
  expensesChange: number
  profitChange:   number
  pendingChange:  number
  periodLabel?:   string
}

type Color = 'green' | 'red' | 'blue' | 'purple'

const colorClasses: Record<Color, { iconBg: string; iconColor: string; changeBg: string; changeText: string }> = {
  green:  { iconBg: 'bg-green-100',  iconColor: 'text-green-600',  changeBg: 'bg-green-100',  changeText: 'text-green-600' },
  red:    { iconBg: 'bg-orange-100', iconColor: 'text-orange-600', changeBg: 'bg-red-100',    changeText: 'text-red-600' },
  blue:   { iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   changeBg: 'bg-green-100',  changeText: 'text-green-600' },
  purple: { iconBg: 'bg-purple-100', iconColor: 'text-purple-600', changeBg: 'bg-green-100',  changeText: 'text-green-600' },
}

interface StatCardProps {
  title:    string
  value:    string
  change:   number
  icon:     React.ReactNode
  color:    Color
  delay?:   number
}

function StatCard({ title, value, change, icon, color, delay = 0 }: StatCardProps) {
  const isPositive = change >= 0
  const changeColor = isPositive ? colorClasses[color].changeText : 'text-red-600'
  const changeBg    = isPositive ? colorClasses[color].changeBg   : 'bg-red-100'

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms`, animation: 'fadeInUp 0.6s ease-out forwards' }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className={`${colorClasses[color].iconBg} p-1.5 sm:p-2 rounded-lg`}>
          <div className={`${colorClasses[color].iconColor} [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>{icon}</div>
        </div>
        {change !== 0 && (
          <div className={`${changeBg} px-1.5 py-0.5 rounded text-xs font-medium ${changeColor}`}>
            {formatPercentage(change)}
          </div>
        )}
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function StatsCards({
  totalIncome, totalExpenses, netProfit, pending,
  incomeChange, expensesChange, profitChange, pendingChange,
  periodLabel,
}: StatsCardsProps) {
  const t      = useTranslations('dashboard.statsCards')
  const locale = useLocale()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div className="mb-8">
      {periodLabel && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium">
            {t('showingData')} <span className="text-primary-600">{periodLabel}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard title={t('totalIncome')}   value={formatCurrency(totalIncome)}   change={incomeChange}   color="green"  delay={0}   icon={<DollarSign  className="w-5 h-5" />} />
        <StatCard title={t('totalExpenses')} value={formatCurrency(totalExpenses)} change={expensesChange} color="red"    delay={100} icon={<CreditCard   className="w-5 h-5" />} />
        <StatCard title={t('netProfit')}     value={formatCurrency(netProfit)}     change={profitChange}   color="blue"   delay={200} icon={<TrendingUp   className="w-5 h-5" />} />
        <StatCard title={t('pending')}       value={String(pending)}               change={pendingChange}  color="purple" delay={300} icon={<Clock        className="w-5 h-5" />} />
      </div>
    </div>
  )
}
