'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Transaction } from '@/data/transactions-data'
import * as categoryService from '@/services/categoryService'
import { useTranslations, useLocale } from 'next-intl'
import { translateCategoryName } from '@/lib/categoryTranslator'
import { useCurrency } from '@/hooks/useCurrency'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit:       (transaction: Transaction) => void
  onDelete:     (transactionId: string) => void
  onReviewed?:  () => void
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const t           = useTranslations('transactions')
  const tCommon     = useTranslations('common')
  const tCategories = useTranslations('categories')
  const locale      = useLocale()
  const { formatCurrency } = useCurrency()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [categoryMap, setCategoryMap] = useState<Record<string, { name: string; type: number }>>({})

  useEffect(() => {
    categoryService.getAll().then(cats => {
      const map: Record<string, { name: string; type: number }> = {}
      cats.forEach(c => { map[c.id.toString()] = { name: c.name, type: c.type } })
      setCategoryMap(map)
    }).catch(() => {})
  }, [])

  const getCategoryLabel = (id: string) =>
    translateCategoryName(categoryMap[id]?.name || '', tCategories) || '—'

  const getCategoryColorClass = (id: string) => {
    const type = categoryMap[id]?.type
    if (type === 0) return 'bg-green-100 text-green-700'
    if (type === 1) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short' })
    } catch { return dateStr }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Edit className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('noTransactions')}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('loadError')}</p>
      </div>
    )
  }

  const totalIncome   = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const totalExpenses = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* ── Mobile card list (hidden on md+) ── */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
        {transactions.map(tx => (
          <div key={tx.id} className="px-3 py-3 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {tx.type === 'income'
                  ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">{tx.description}</p>
                  <p className={`text-sm font-bold shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(tx.date)}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${getCategoryColorClass(tx.category)}`}>
                    {getCategoryLabel(tx.category)}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    tx.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {tx.status === 'completed' ? t('completed') : t('pending')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => onEdit(tx)}
                  className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowDeleteConfirm(tx.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{t('date')}</th>
              <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[30%]">{t('description')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[16%]">{t('category')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{t('amount')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[14%]">{t('status')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">{tCommon('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-4 text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tx.date}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={tx.description}>{tx.description}</p>
                  {tx.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{tx.notes}</p>}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColorClass(tx.category)}`}>
                    {getCategoryLabel(tx.category)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.status === 'completed' ? t('completed') : t('pending')}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(tx)} className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(tx.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tCommon('showing')} {transactions.length} {t('transactionsLabel')}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{t('incomes')}: <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span></span>
            <span className="text-gray-500 dark:text-gray-400">{t('expenses')}: <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span></span>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{tCommon('delete')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('deleteConfirmTitle')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">{t('deleteConfirmMsg', { name: '' })}</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                {tCommon('cancel')}
              </button>
              <button onClick={() => { onDelete(showDeleteConfirm); setShowDeleteConfirm(null) }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                {tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
