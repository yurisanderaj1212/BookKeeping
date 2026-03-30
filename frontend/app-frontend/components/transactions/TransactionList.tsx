'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Transaction } from '@/data/transactions-data'
import * as categoryService from '@/services/categoryService'
import { useTranslations, useLocale } from 'next-intl'
import { translateCategoryName } from '@/lib/categoryTranslator'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit:       (transaction: Transaction) => void
  onDelete:     (transactionId: string) => void
  onReviewed?:  () => void
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const t      = useTranslations('transactions')
  const tCommon = useTranslations('common')
  const tCategories = useTranslations('categories')
  const locale = useLocale()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [categoryMap, setCategoryMap] = useState<Record<string, { name: string; type: number }>>({})

  useEffect(() => {
    categoryService.getAll().then(cats => {
      const map: Record<string, { name: string; type: number }> = {}
      cats.forEach(c => { map[c.id.toString()] = { name: c.name, type: c.type } })
      setCategoryMap(map)
    }).catch(() => {})
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  const getCategoryLabel = (id: string) =>
    translateCategoryName(categoryMap[id]?.name || '', tCategories) || '—'

  const getCategoryColorClass = (id: string) => {
    const type = categoryMap[id]?.type
    if (type === 0) return 'bg-green-100 text-green-800'
    if (type === 1) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Edit className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noTransactions')}</h3>
        <p className="text-gray-500">{t('loadError')}</p>
      </div>
    )
  }

  const totalIncome   = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const totalExpenses = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>{t('date')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '30%' }}>{t('description')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '16%' }}>{t('category')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>{t('amount')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>{t('status')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>{tCommon('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-4 text-center">
                  <p className="text-sm font-medium text-gray-900">{tx.date}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900 truncate" title={tx.description}>{tx.description}</p>
                  {tx.notes && <p className="text-xs text-gray-500 mt-1 truncate" title={tx.notes}>{tx.notes}</p>}
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
                  <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => onEdit(tx)} className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors" title={tCommon('edit')}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(tx.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors" title={tCommon('delete')}>
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
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {tCommon('showing')} {transactions.length} {t('transactionsLabel')}
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">{t('incomes')}: </span>
              <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('expenses')}: </span>
              <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full shadow-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tCommon('delete')}</h3>
                <p className="text-sm text-gray-500">{t('deleteConfirmTitle')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 text-sm">{t('deleteConfirmMsg', { name: '' })}</p>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
                {tCommon('cancel')}
              </button>
              <button onClick={() => { onDelete(showDeleteConfirm); setShowDeleteConfirm(null) }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                {tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
