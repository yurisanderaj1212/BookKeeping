'use client'

import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { 
  getTotalIncome, 
  getTotalExpenses, 
  getNetProfit, 
  formatCurrency,
  getTransactionsByType,
  getPendingTransactionsCount,
  getCompletedTransactions
} from '@/data/transactions-data'
import { getCategoriesByType } from '@/data/categories-data'

interface FinancialSummaryReportProps {
  period: string
  year: string
  month: string
}

export default function FinancialSummaryReport({ period, year, month }: FinancialSummaryReportProps) {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0
  
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

  // Calculate top categories
  const incomeCategories = getCategoriesByType('income')
  const expenseCategories = getCategoriesByType('expense')
  
  const topIncomeCategories = incomeCategories.map(category => {
    const categoryTransactions = incomeTransactions.filter(t => t.category === category.id)
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    return { name: category.name, amount: total, count: categoryTransactions.length }
  }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)

  const topExpenseCategories = expenseCategories.map(category => {
    const categoryTransactions = expenseTransactions.filter(t => t.category === category.id)
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
    return { name: category.name, amount: total, count: categoryTransactions.length }
  }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Report Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Resumen Financiero</h2>
            <p className="text-sm text-gray-600 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Chill Numbers</p>
            <p>Generado el {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-green-600 font-medium">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-green-600 mt-1">{incomeTransactions.length} transacciones</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm text-red-600 font-medium">Gastos Totales</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-600 mt-1">{expenseTransactions.length} transacciones</p>
          </div>

          <div className={`${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              {netProfit >= 0 ? 
                <TrendingUp className="w-4 h-4 text-blue-600" /> : 
                <TrendingDown className="w-4 h-4 text-orange-600" />
              }
            </div>
            <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netProfit >= 0 ? 'Beneficio Neto' : 'Pérdida Neta'}
            </p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`text-xs mt-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Margen: {profitMargin.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Estado de Transacciones</p>
            <p className="text-lg font-bold text-gray-700">{completedTransactions.length} Completadas</p>
            <p className="text-xs text-gray-600 mt-1">{pendingCount} pendientes</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Desglose de Ingresos</h4>
            <div className="space-y-3">
              {topIncomeCategories.length > 0 ? (
                topIncomeCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.count} transacciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-green-600">
                        {((category.amount / totalIncome) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay ingresos en este período</p>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Desglose de Gastos</h4>
            <div className="space-y-3">
              {topExpenseCategories.length > 0 ? (
                topExpenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.count} transacciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-red-600">
                        {((category.amount / totalExpenses) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay gastos en este período</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Este reporte incluye todas las transacciones registradas en el período seleccionado.</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}