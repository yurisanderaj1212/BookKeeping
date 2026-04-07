'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react'
import { 
  getTransactionsByType,
  formatCurrency
} from '@/data/transactions-data'
import { getCategoriesByType, Category } from '@/data/categories-data'

interface CategoryBreakdownReportProps {
  period: string
  year: string
  month: string
}

export default function CategoryBreakdownReport({ period, year, month }: CategoryBreakdownReportProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')

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

  // Generate category data
  const generateCategoryData = (type: 'income' | 'expense') => {
    const transactions = getTransactionsByType(type)
    const categories = getCategoriesByType(type)
    
    const categoryStats = categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category.id)
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      const transactionCount = categoryTransactions.length
      const avgTransaction = transactionCount > 0 ? totalAmount / transactionCount : 0
      const completedTransactions = categoryTransactions.filter(t => t.status === 'completed').length
      const pendingTransactions = categoryTransactions.filter(t => t.status === 'pending').length
      
      return {
        category,
        totalAmount,
        transactionCount,
        avgTransaction,
        completedTransactions,
        pendingTransactions,
        percentage: 0 // Will be calculated after getting total
      }
    }).filter(cat => cat.totalAmount > 0) // Only show categories with transactions
    
    // Calculate percentages
    const totalAmount = categoryStats.reduce((sum, cat) => sum + cat.totalAmount, 0)
    categoryStats.forEach(cat => {
      cat.percentage = totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0
    })
    
    // Sort by amount descending
    return categoryStats.sort((a, b) => b.totalAmount - a.totalAmount)
  }

  const incomeData = generateCategoryData('income')
  const expenseData = generateCategoryData('expense')
  const currentData = activeTab === 'income' ? incomeData : expenseData
  const totalAmount = currentData.reduce((sum, cat) => sum + cat.totalAmount, 0)
  const totalTransactions = currentData.reduce((sum, cat) => sum + cat.transactionCount, 0)

  const CategoryRow = ({ data, index }: { data: any, index: number }) => (
    <tr className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: data.category.color }}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{data.category.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.category.description}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.transactionCount}</span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-green-600 font-medium">{data.completedTransactions}</span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-yellow-600 font-medium">{data.pendingTransactions}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className={`text-lg font-bold ${activeTab === 'income' ? 'text-green-700' : 'text-red-700'}`}>
          {formatCurrency(data.totalAmount)}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-gray-600 dark:text-gray-400 font-medium">{formatCurrency(data.avgTransaction)}</span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {data.percentage.toFixed(1)}%
        </span>
      </td>
    </tr>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Report Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Desglose por Categorías</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>Chill Numbers</p>
            <p>Generado el {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('income')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'income'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Categorías de Ingresos</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {incomeData.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'expense'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>Categorías de Gastos</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {expenseData.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${activeTab === 'income' ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
            <div className="flex items-center space-x-2 mb-2">
              {activeTab === 'income' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                Total {activeTab === 'income' ? 'Ingresos' : 'Gastos'}
              </span>
            </div>
            <p className={`text-2xl font-bold ${activeTab === 'income' ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías Activas</span>
            </div>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{currentData.length}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Transacciones</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{totalTransactions}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Promedio por Categoría</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(currentData.length > 0 ? totalAmount / currentData.length : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transacciones
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Completadas
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pendientes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monto Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Promedio
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((data, index) => (
                <CategoryRow key={data.category.id} data={data} index={index} />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay datos de categorías para mostrar en este período
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Mostrando {currentData.length} categorías con actividad en el período seleccionado
          </span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}