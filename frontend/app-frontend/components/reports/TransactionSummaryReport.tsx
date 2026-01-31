'use client'

import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { 
  getTotalIncome, 
  getTotalExpenses, 
  getNetProfit, 
  formatCurrency,
  getTransactionsByType,
  getPendingTransactionsCount,
  getCompletedTransactions,
  mockTransactions
} from '@/data/transactions-data'

interface TransactionSummaryReportProps {
  period: string
  year: string
  month: string
}

export default function TransactionSummaryReport({ period, year, month }: TransactionSummaryReportProps) {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  
  const incomeTransactions = getTransactionsByType('income')
  const expenseTransactions = getTransactionsByType('expense')
  const pendingCount = getPendingTransactionsCount()
  const completedTransactions = getCompletedTransactions()

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

  // Calcular estadísticas por estado
  const pendingIncome = incomeTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
  const pendingExpenses = expenseTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
  const completedIncome = incomeTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const completedExpenses = expenseTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)

  // Calcular promedios
  const avgIncomeTransaction = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0
  const avgExpenseTransaction = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Report Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Resumen de Transacciones</h2>
            <p className="text-sm text-gray-600 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Chill Numbers</p>
            <p>Generado el {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Summary Overview */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {incomeTransactions.length}
              </span>
            </div>
            <p className="text-sm text-green-600 font-medium">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-green-600 mt-1">
              Promedio: {formatCurrency(avgIncomeTransaction)}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {expenseTransactions.length}
              </span>
            </div>
            <p className="text-sm text-red-600 font-medium">Total Gastos</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-600 mt-1">
              Promedio: {formatCurrency(avgExpenseTransaction)}
            </p>
          </div>

          <div className={`${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-2">
              {netProfit >= 0 ? 
                <TrendingUp className="w-5 h-5 text-blue-600" /> : 
                <TrendingDown className="w-5 h-5 text-orange-600" />
              }
              <span className={`text-xs px-2 py-1 rounded-full ${
                netProfit >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {((netProfit / totalIncome) * 100).toFixed(1)}%
              </span>
            </div>
            <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netProfit >= 0 ? 'Beneficio Neto' : 'Pérdida Neta'}
            </p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`text-xs mt-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Margen de beneficio
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                {mockTransactions.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Transacciones</p>
            <p className="text-2xl font-bold text-gray-700">{mockTransactions.length}</p>
            <p className="text-xs text-gray-600 mt-1">
              En el período
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Transacciones</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completed Transactions */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-md font-semibold text-gray-900">Transacciones Completadas</h4>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {completedTransactions.length}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ingresos Completados</p>
                  <p className="text-sm text-gray-600">
                    {incomeTransactions.filter(t => t.status === 'completed').length} transacciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">{formatCurrency(completedIncome)}</p>
                  <p className="text-xs text-green-600">
                    {totalIncome > 0 ? ((completedIncome / totalIncome) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Gastos Completados</p>
                  <p className="text-sm text-gray-600">
                    {expenseTransactions.filter(t => t.status === 'completed').length} transacciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">{formatCurrency(completedExpenses)}</p>
                  <p className="text-xs text-red-600">
                    {totalExpenses > 0 ? ((completedExpenses / totalExpenses) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h4 className="text-md font-semibold text-gray-900">Transacciones Pendientes</h4>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ingresos Pendientes</p>
                  <p className="text-sm text-gray-600">
                    {incomeTransactions.filter(t => t.status === 'pending').length} transacciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-700">{formatCurrency(pendingIncome)}</p>
                  <p className="text-xs text-yellow-600">
                    Por cobrar
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Gastos Pendientes</p>
                  <p className="text-sm text-gray-600">
                    {expenseTransactions.filter(t => t.status === 'pending').length} transacciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-700">{formatCurrency(pendingExpenses)}</p>
                  <p className="text-xs text-orange-600">
                    Por pagar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Este resumen incluye todas las transacciones registradas en el período seleccionado.
          </span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}