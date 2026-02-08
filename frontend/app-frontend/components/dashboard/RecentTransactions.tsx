'use client'

import { Transaction } from '../../data/dashboard-data'
import { getCategoryName } from '../../data/categories-data'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const router = useRouter()
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'MMM dd')
  }

  const getStatusColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <ArrowDownRight className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-red-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
          <p className="text-sm text-gray-500 mt-1">Últimas actividades financieras</p>
        </div>
        <button 
          onClick={() => router.push('/transactions')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>Ver Todas</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {transactions.slice(0, 6).map((transaction, index) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200 group cursor-pointer"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.5s ease-out forwards'
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{getCategoryName(transaction.category)}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getStatusColor(transaction.type)}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <div className="flex items-center justify-end mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No hay transacciones aún</p>
            <p className="text-gray-400 text-xs mt-1">Agrega tu primera transacción para comenzar</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
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