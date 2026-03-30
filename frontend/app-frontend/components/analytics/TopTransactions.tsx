'use client'

import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp } from 'lucide-react'
import { mockTransactions, formatCurrency } from '@/data/transactions-data'
import { getCategoryName } from '@/data/categories-data'

interface TopTransactionsProps {
  period: string
  year: string
  month: string
}

export default function TopTransactions({ period }: TopTransactionsProps) {
  // Get top transactions by amount
  const topTransactions = mockTransactions
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  const topIncome = mockTransactions
    .filter(t => t.type === 'income')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const topExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const TransactionRow = ({ transaction, rank }: { transaction: any, rank: number }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {rank}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {transaction.type === 'income' ? (
            <ArrowUpRight className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {transaction.description}
            </p>
            <p className="text-xs text-gray-500">
              {getCategoryName(transaction.category)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center text-sm text-gray-600">
        {new Date(transaction.date).toLocaleDateString('es-ES')}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-sm font-bold ${
          transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          transaction.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {transaction.status === 'completed' ? 'Completada' : 'Pendiente'}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6 mb-8">
      {/* Top Transactions Overall */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top Transacciones</h3>
            <p className="text-sm text-gray-500 mt-1">
              Las 10 transacciones más grandes del período
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>Ordenado por monto</span>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[8%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="w-[40%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="w-[20%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="w-[17%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topTransactions.map((transaction, index) => (
                <TransactionRow 
                  key={transaction.id} 
                  transaction={transaction} 
                  rank={index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Income vs Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Income */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Top Ingresos</h4>
            <div className="bg-green-100 p-1 rounded-full">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </div>
          </div>

          <div className="space-y-3">
            {topIncome.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-800">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">
                  +{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Top 5</span>
              <span className="text-lg font-bold text-green-700">
                +{formatCurrency(topIncome.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Top Gastos</h4>
            <div className="bg-red-100 p-1 rounded-full">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
          </div>

          <div className="space-y-3">
            {topExpenses.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-800">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-700">
                  -{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Top 5</span>
              <span className="text-lg font-bold text-red-700">
                -{formatCurrency(topExpenses.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}