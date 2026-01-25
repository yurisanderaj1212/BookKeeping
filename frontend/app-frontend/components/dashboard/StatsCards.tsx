'use client'

import { formatPercentage } from '../../data/dashboard-data'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Clock } from 'lucide-react'

interface StatCardProps {
  title: string
  amount: number
  change: number
  icon: React.ReactNode
  color: 'green' | 'red' | 'blue' | 'purple'
  delay?: number
}

function StatCard({ title, amount, change, icon, color, delay = 0 }: StatCardProps) {
  // Format currency in Spanish
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const colorClasses = {
    green: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      changeBg: 'bg-green-100',
      changeText: 'text-green-600'
    },
    red: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      changeBg: 'bg-red-100',
      changeText: 'text-red-600'
    },
    blue: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeBg: 'bg-green-100',
      changeText: 'text-green-600'
    },
    purple: {
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeBg: 'bg-green-100',
      changeText: 'text-green-600'
    }
  }

  const isPositive = change >= 0
  const changeColor = isPositive ? colorClasses[color].changeText : 'text-red-600'
  const changeBg = isPositive ? colorClasses[color].changeBg : 'bg-red-100'

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Header with icon and change percentage */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${colorClasses[color].iconBg} p-2 rounded-lg`}>
          <div className={colorClasses[color].iconColor}>
            {icon}
          </div>
        </div>
        <div className={`${changeBg} px-2 py-1 rounded text-xs font-medium ${changeColor}`}>
          {formatPercentage(change)}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-gray-500 mb-2">{title}</p>

      {/* Amount */}
      <p className="text-2xl font-bold text-gray-900">
        {title === 'Asuntos pendientes' ? amount.toString() : formatCurrency(amount)}
      </p>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pending: number
  incomeChange: number
  expensesChange: number
  profitChange: number
  pendingChange: number
}

export default function StatsCards({
  totalIncome,
  totalExpenses,
  netProfit,
  pending,
  incomeChange,
  expensesChange,
  profitChange,
  pendingChange
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Ingresos totales"
        amount={totalIncome}
        change={incomeChange}
        color="green"
        delay={0}
        icon={<DollarSign className="w-5 h-5" />}
      />
      
      <StatCard
        title="Gastos totales"
        amount={totalExpenses}
        change={expensesChange}
        color="red"
        delay={100}
        icon={<CreditCard className="w-5 h-5" />}
      />
      
      <StatCard
        title="Beneficio neto"
        amount={netProfit}
        change={profitChange}
        color="blue"
        delay={200}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      
      <StatCard
        title="Asuntos pendientes"
        amount={pending}
        change={pendingChange}
        color="purple"
        delay={300}
        icon={<Clock className="w-5 h-5" />}
      />
    </div>
  )
}