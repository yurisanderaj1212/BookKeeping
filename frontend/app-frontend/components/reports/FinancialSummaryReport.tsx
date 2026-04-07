'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { getFinancialSummary, formatCurrency, type ReportParams } from '@/services/reportService'
import { useTranslations } from 'next-intl'
import { translateCategoryName } from '@/lib/categoryTranslator'

interface FinancialSummaryReportProps {
  period: string
  year: string
  month: string
}

export default function FinancialSummaryReport({ period, year, month }: FinancialSummaryReportProps) {
  const t = useTranslations('reports.financial')
  const tMonths = useTranslations('reports.months')
  const tCategories = useTranslations('categories')

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params: ReportParams = {
      period: period as ReportParams['period'],
      year: parseInt(year),
      month: period === 'year' ? undefined : parseInt(month),
    }
    getFinancialSummary(params)
      .then(setData)
      .catch((e: any) => setError(e.message ?? t('loadError')))
      .finally(() => setLoading(false))
  }, [period, year, month])

  const getPeriodLabel = () => {
    if (period === 'week') return t('currentWeek')
    if (period === 'month') return `${tMonths(String(parseInt(month)) as any)} ${year}`
    return `${t('year')} ${year}`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('loadError')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-sm">{error}</div>
    )
  }

  if (!data) return null

  const { totalIncome, totalExpenses, netProfit, profitMargin, incomeCount, expenseCount, transactionCount, incomeBreakdown, expenseBreakdown } = data

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>Chill Numbers</p>
            <p>{t('generatedOn')} {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('executiveSummary')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <DollarSign className="w-4 h-4 text-green-600" />
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 font-medium">{t('totalIncome')}</p>
            <p className="text-lg sm:text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-green-600 mt-0.5">{incomeCount} {t('transactions')}</p>
          </div>

          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <DollarSign className="w-4 h-4 text-red-600" />
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            </div>
            <p className="text-xs text-red-600 font-medium">{t('totalExpenses')}</p>
            <p className="text-lg sm:text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-600 mt-0.5">{expenseCount} {t('transactions')}</p>
          </div>

          <div className={`${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-3 sm:p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-1.5">
              <DollarSign className={`w-4 h-4 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              {netProfit >= 0
                ? <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                : <TrendingDown className="w-3.5 h-3.5 text-orange-600" />}
            </div>
            <p className={`text-xs font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netProfit >= 0 ? t('netProfit') : t('netLoss')}
            </p>
            <p className={`text-lg sm:text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`text-xs mt-0.5 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {t('margin')}: {profitMargin.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('totalTransactions')}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-700 dark:text-gray-300">{transactionCount}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t('inPeriod')}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('incomeBreakdown')}</h4>
            <div className="space-y-3">
              {incomeBreakdown.length > 0 ? incomeBreakdown.slice(0, 5).map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{translateCategoryName(cat.categoryName, tCategories)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cat.transactionCount} {t('transactions')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{formatCurrency(cat.amount)}</p>
                    <p className="text-xs text-green-600">{cat.percentage}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noIncome')}</p>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('expenseBreakdown')}</h4>
            <div className="space-y-3">
              {expenseBreakdown.length > 0 ? expenseBreakdown.slice(0, 5).map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{translateCategoryName(cat.categoryName, tCategories)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cat.transactionCount} {t('transactions')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">{formatCurrency(cat.amount)}</p>
                    <p className="text-xs text-red-600">{cat.percentage}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noExpenses')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{t('reportNote')}</span>
          <span>{t('page')} 1 {t('of')} 1</span>
        </div>
      </div>
    </div>
  )
}
