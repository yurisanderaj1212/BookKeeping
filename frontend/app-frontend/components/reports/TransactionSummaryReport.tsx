'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { getTransactionSummary, formatCurrency, type ReportParams } from '@/services/reportService'
import { useTranslations } from 'next-intl'
import { translateCategoryName } from '@/lib/categoryTranslator'

interface TransactionSummaryReportProps {
  period: string
  year: string
  month: string
}

export default function TransactionSummaryReport({ period, year, month }: TransactionSummaryReportProps) {
  const t = useTranslations('reports.rptTransactionSummary')
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
    getTransactionSummary(params)
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

  const {
    totalTransactions, totalIncome, totalExpenses, netProfit,
    pendingCount, completedCount, incomeCount, expenseCount, transactions,
  } = data

  const avgIncome  = incomeCount  > 0 ? totalIncome  / incomeCount  : 0
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0

  // Completed vs pending amounts
  const completedIncome   = transactions.filter((r: any) => r.type === 1 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
  const completedExpenses = transactions.filter((r: any) => r.type === 2 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
  const pendingIncome     = transactions.filter((r: any) => r.type === 1 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)
  const pendingExpenses   = transactions.filter((r: any) => r.type === 2 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)

  const completedIncomeCount   = transactions.filter((r: any) => r.type === 1 && r.status === 0).length
  const completedExpensesCount = transactions.filter((r: any) => r.type === 2 && r.status === 0).length
  const pendingIncomeCount     = transactions.filter((r: any) => r.type === 1 && r.status === 1).length
  const pendingExpensesCount   = transactions.filter((r: any) => r.type === 2 && r.status === 1).length

  // Recent 10 transactions
  const recent = transactions.slice(0, 10)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-sm text-gray-600 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Chill Numbers</p>
            <p>{t('generatedOn')} {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('generalSummary')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">{incomeCount}</span>
            </div>
            <p className="text-xs text-green-600 font-medium">{t('totalIncome')}</p>
            <p className="text-lg sm:text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-green-600 mt-0.5">{t('average')}: {formatCurrency(avgIncome)}</p>
          </div>

          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">{expenseCount}</span>
            </div>
            <p className="text-xs text-red-600 font-medium">{t('totalExpenses')}</p>
            <p className="text-lg sm:text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-600 mt-0.5">{t('average')}: {formatCurrency(avgExpense)}</p>
          </div>

          <div className={`${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-3 sm:p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-1.5">
              {netProfit >= 0
                ? <TrendingUp className="w-4 h-4 text-blue-600" />
                : <TrendingDown className="w-4 h-4 text-orange-600" />}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${netProfit >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
            <p className={`text-xs font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netProfit >= 0 ? t('netProfit') : t('netLoss')}
            </p>
            <p className={`text-lg sm:text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`text-xs mt-0.5 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{t('profitMargin')}</p>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full">{totalTransactions}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">{t('totalTransactions')}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-700">{totalTransactions}</p>
            <p className="text-xs text-gray-600 mt-0.5">{t('inPeriod')}</p>
          </div>
        </div>
      </div>

      {/* Completed vs Pending */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completed */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-md font-semibold text-gray-900">Completadas</h4>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{completedCount}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ingresos</p>
                  <p className="text-sm text-gray-600">{completedIncomeCount} transacciones</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">{formatCurrency(completedIncome)}</p>
                  <p className="text-xs text-green-600">{totalIncome > 0 ? ((completedIncome / totalIncome) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Gastos</p>
                  <p className="text-sm text-gray-600">{completedExpensesCount} transacciones</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">{formatCurrency(completedExpenses)}</p>
                  <p className="text-xs text-red-600">{totalExpenses > 0 ? ((completedExpenses / totalExpenses) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h4 className="text-md font-semibold text-gray-900">Pendientes</h4>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{pendingCount}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ingresos</p>
                  <p className="text-sm text-gray-600">{pendingIncomeCount} transacciones</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-700">{formatCurrency(pendingIncome)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Gastos</p>
                  <p className="text-sm text-gray-600">{pendingExpensesCount} transacciones</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-700">{formatCurrency(pendingExpenses)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('recentTransactions')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('colDate')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('colDescription')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('colCategory')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('colAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((tx: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{new Date(tx.date + 'T00:00:00').toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-gray-900 max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-3 py-2 text-gray-600">{translateCategoryName(tx.categoryName, tCategories)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${tx.type === 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 1 ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t('reportNote')}</span>
          <span>{t('page')} 1 {t('of')} 1</span>
        </div>
      </div>
    </div>
  )
}
