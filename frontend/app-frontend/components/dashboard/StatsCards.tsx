'use client'

import { formatPercentage } from '../../data/dashboard-data'
import { useLanguage } from '../../hooks/useLanguage'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Clock } from 'lucide-react'

interface StatCardProps {
  title: string
  amount: number
  change: number
  icon: React.ReactNode
  color: 'green' | 'red' | 'blue' | 'yellow'
  delay?: number
}

function StatCard({ title, amount, change, icon, color, delay = 0 }: StatCardProps) {
  const { language } = useLanguage()
  
  // Format currency based on language
  const formatCurrency = (amount: number): string => {
    if (language === 'es') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-600',
      border: 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-600',
      border: 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      gradient: 'from-yellow-500 to-yellow-600'
    }
  }

  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  const changeBg = isPositive ? 'bg-green-100' : 'bg-red-100'
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div 
      className={`bg-white rounded-xl border ${colorClasses[color].border} p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer`}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline mb-3">
            <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
              {formatCurrency(amount)}
            </p>
          </div>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${changeBg}`}>
            <ChangeIcon className={`w-3 h-3 ${changeColor}`} />
            <span className={`text-xs font-medium ${changeColor}`}>
              {formatPercentage(change)}
            </span>
            <span className="text-xs text-gray-500">from last week</span>
          </div>
        </div>
        <div className={`${colorClasses[color].bg} p-4 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
          <div className={colorClasses[color].icon}>
            {icon}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-1.5 bg-gradient-to-r ${colorClasses[color].gradient} rounded-full transition-all duration-1000 ease-out`}
          style={{ 
            width: `${Math.min(Math.abs(change) * 2, 100)}%`,
            animationDelay: `${delay + 300}ms`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
        title="Total Income"
        amount={totalIncome}
        change={incomeChange}
        color="green"
        delay={0}
        icon={<DollarSign className="w-7 h-7" />}
      />
      
      <StatCard
        title="Total Expenses"
        amount={totalExpenses}
        change={expensesChange}
        color="red"
        delay={100}
        icon={<CreditCard className="w-7 h-7" />}
      />
      
      <StatCard
        title="Net Profit"
        amount={netProfit}
        change={profitChange}
        color="blue"
        delay={200}
        icon={<PiggyBank className="w-7 h-7" />}
      />
      
      <StatCard
        title="Pending Items"
        amount={pending}
        change={pendingChange}
        color="yellow"
        delay={300}
        icon={<Clock className="w-7 h-7" />}
      />
    </div>
  )
}