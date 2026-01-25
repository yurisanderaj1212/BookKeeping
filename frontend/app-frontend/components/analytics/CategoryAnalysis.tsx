'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency, getTransactionsByType, mockTransactions } from '../../data/transactions-data'
import { getCategoriesByType, getCategoryById } from '../../data/categories-data'

interface CategoryAnalysisProps {
  period: string
  year: string
  month: string
}

export default function CategoryAnalysis({ period }: CategoryAnalysisProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate real category data from transactions
  const generateCategoryData = (type: 'income' | 'expense') => {
    const transactions = getTransactionsByType(type)
    const categories = getCategoriesByType(type)
    
    const categoryStats = categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category.id)
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      const transactionCount = categoryTransactions.length
      const avgTransaction = transactionCount > 0 ? totalAmount / transactionCount : 0
      
      return {
        categoryId: category.id,
        name: category.name,
        amount: totalAmount,
        percentage: 0, // Will be calculated after getting total
        color: category.color,
        transactions: transactionCount,
        avgTransaction
      }
    }).filter(cat => cat.amount > 0) // Only show categories with transactions
    
    // Calculate percentages
    const totalAmount = categoryStats.reduce((sum, cat) => sum + cat.amount, 0)
    categoryStats.forEach(cat => {
      cat.percentage = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
    })
    
    // Sort by amount descending
    return categoryStats.sort((a, b) => b.amount - a.amount)
  }

  const incomeCategories = generateCategoryData('income')
  const expenseCategories = generateCategoryData('expense')

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600">
            Monto: <span className="font-semibold">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-semibold">{data.percentage}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Transacciones: <span className="font-semibold">{data.transactions}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CategoryCard = ({ category }: { category: any }) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-medium text-gray-900">{category.name}</span>
        </div>
        <span className="text-sm text-gray-500">{category.percentage}%</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monto total</span>
          <span className="font-semibold text-gray-900">{formatCurrency(category.amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Transacciones</span>
          <span className="text-gray-700">{category.transactions}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Promedio</span>
          <span className="text-gray-700">{formatCurrency(category.avgTransaction)}</span>
        </div>
      </div>
    </div>
  )

  const currentData = activeTab === 'income' ? incomeCategories : expenseCategories
  const totalAmount = currentData.reduce((sum, cat) => sum + cat.amount, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análisis por Categorías</h3>
          <p className="text-sm text-gray-500 mt-1">
            Distribución detallada de {activeTab === 'income' ? 'ingresos' : 'gastos'} por categoría
          </p>
        </div>
        <button 
          onClick={() => router.push('/categories')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>Ver Categorías</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'income'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'expense'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gastos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Distribución de {activeTab === 'income' ? 'Ingresos' : 'Gastos'}
          </h4>
          <div className="h-80 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="amount"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">Cargando gráfico...</div>
            )}
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total {activeTab === 'income' ? 'ingresos' : 'gastos'}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Detalles por Categoría
          </h4>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {currentData.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}