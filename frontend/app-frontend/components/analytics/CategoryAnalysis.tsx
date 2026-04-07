'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatCurrency, getTransactionsByType } from '../../data/transactions-data'
import { getCategoriesByType } from '../../data/categories-data'

interface CategoryAnalysisProps {
  period: string
  year: string
  month: string
}

export default function CategoryAnalysis({ period }: CategoryAnalysisProps) {
  const t = useTranslations('analytics.categoryAnalysis')
  const router = useRouter()
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 })
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('category-analysis-chart-container')
      if (container) {
        setDimensions({ width: container.offsetWidth, height: 320 })
      }
    }
    updateDimensions()
    const timer = setTimeout(updateDimensions, 100)
    window.addEventListener('resize', updateDimensions)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  const generateCategoryData = (type: 'income' | 'expense') => {
    const transactions = getTransactionsByType(type)
    const categories = getCategoriesByType(type)
    const categoryStats = categories.map(category => {
      const categoryTransactions = transactions.filter(tx => tx.category === category.id)
      const totalAmount = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      const transactionCount = categoryTransactions.length
      const avgTransaction = transactionCount > 0 ? totalAmount / transactionCount : 0
      return {
        categoryId: category.id,
        name: category.name,
        amount: totalAmount,
        percentage: 0,
        color: category.color,
        transactions: transactionCount,
        avgTransaction,
      }
    }).filter(cat => cat.amount > 0)
    const totalAmount = categoryStats.reduce((sum, cat) => sum + cat.amount, 0)
    categoryStats.forEach(cat => {
      cat.percentage = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
    })
    return categoryStats.sort((a, b) => b.amount - a.amount)
  }

  const incomeCategories = generateCategoryData('income')
  const expenseCategories = generateCategoryData('expense')

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('amount')}: <span className="font-semibold">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('percentage')}: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('transactions')}: <span className="font-semibold">{data.transactions}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CategoryCard = ({ category }: { category: any }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{category.percentage.toFixed(1)}%</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('amount')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(category.amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('transactions')}</span>
          <span className="text-gray-700 dark:text-gray-300">{category.transactions}</span>
        </div>
      </div>
    </div>
  )

  const currentData = activeTab === 'income' ? incomeCategories : expenseCategories
  const totalAmount = currentData.reduce((sum, cat) => sum + cat.amount, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'income' ? t('subtitleIncome') : t('subtitleExpense')}
          </p>
        </div>
        <button
          onClick={() => router.push('/categories')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>{t('viewCategories')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'income' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
          }`}
        >
          {t('tabIncome')}
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'expense' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
          }`}
        >
          {t('tabExpense')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
            {activeTab === 'income' ? t('distributionIncome') : t('distributionExpense')}
          </h4>
          <div id="category-analysis-chart-container" className="w-full flex items-center justify-center" style={{ height: 320 }}>
            {dimensions.width > 0 ? (
              <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
                <PieChart>
                  <Pie data={currentData} cx="50%" cy="50%" outerRadius={100} innerRadius={40}
                    fill="#8884d8" dataKey="amount" animationBegin={0} animationDuration={1000}>
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">{t('noData')}</div>
            )}
          </div>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === 'income' ? t('totalIncome') : t('totalExpenses')}
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">{t('detailsTitle')}</h4>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {currentData.length > 0 ? (
              currentData.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('noData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
