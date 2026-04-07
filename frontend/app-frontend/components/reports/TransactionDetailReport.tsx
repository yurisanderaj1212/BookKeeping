'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Filter } from 'lucide-react'
import { 
  mockTransactions,
  formatCurrency,
  Transaction
} from '@/data/transactions-data'
import { getCategoryName } from '@/data/categories-data'

interface TransactionDetailReportProps {
  period: string
  year: string
  month: string
}

export default function TransactionDetailReport({ period, year, month }: TransactionDetailReportProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')

  const getPeriodLabel = () => {
    switch (period) {
      case 'month':
        return `Mes de ${getMonthName(month)} ${year}`
      case 'quarter':
        return `Trimestre ${Math.ceil(parseInt(month) / 3)} ${year}`
      case 'year':
        return `Año ${year}`
      default:
        return 'Período personalizado'
    }
  }

  const getMonthName = (monthNum: string) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[parseInt(monthNum) - 1] || 'Mes'
  }

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    if (filterType !== 'all' && transaction.type !== filterType) return false
    if (filterStatus !== 'all' && transaction.status !== filterStatus) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const incomeTotal = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenseTotal = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">
      <td className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
        {new Date(transaction.date).toLocaleDateString('es-ES')}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center space-x-1">
          {transaction.type === 'income' ? (
            <ArrowUpRight className="w-3 h-3 text-green-600 shrink-0" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-red-600 shrink-0" />
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium truncate ${
            transaction.type === 'income' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
        <div className="truncate" title={transaction.description}>
          {transaction.description}
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="truncate" title={getCategoryName(transaction.category)}>
          {getCategoryName(transaction.category)}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center space-x-1">
          {transaction.status === 'completed' ? (
            <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
          ) : (
            <Clock className="w-3 h-3 text-yellow-600 shrink-0" />
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium truncate ${
            transaction.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {transaction.status === 'completed' ? 'Completada' : 'Pendiente'}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm font-semibold text-right">
        <span className={transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="truncate" title={transaction.notes || ''}>
          {transaction.notes || '-'}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Report Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalle de Transacciones</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>Chill Numbers</p>
            <p>Generado el {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Filters and Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Solo ingresos</option>
              <option value="expense">Solo gastos</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Solo completadas</option>
              <option value="pending">Solo pendientes</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Transacciones</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{filteredTransactions.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Ingresos</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(incomeTotal)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Total Gastos</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(expenseTotal)}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6">
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-[12%] px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron transacciones con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Mostrando {filteredTransactions.length} transacciones de {mockTransactions.length} totales
          </span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}