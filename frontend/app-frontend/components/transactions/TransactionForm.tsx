'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Transaction } from '@/data/transactions-data'
import * as categoryService from '@/services/categoryService'
import accountService, { Account } from '@/services/accountService'
import { useTranslations, useLocale } from 'next-intl'
import { translateCategoryName } from '@/lib/categoryTranslator'

interface TransactionFormProps {
  isOpen:       boolean
  onClose:      () => void
  onSave:       (transaction: Transaction) => void
  transaction?: Transaction | null
  mode:         'create' | 'edit'
}

export default function TransactionForm({ isOpen, onClose, onSave, transaction, mode = 'create' }: TransactionFormProps) {
  const t      = useTranslations('transactions')
  const tCommon = useTranslations('common')
  const tCategories = useTranslations('categories')
  const locale = useLocale()

  const [formData, setFormData] = useState({
    type: 'income', amount: '', description: '', category: '',
    date: new Date().toISOString().split('T')[0], status: 'pending', notes: '', accountId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<{ income: Array<{ value: string; label: string; isSystem: boolean }>; expense: Array<{ value: string; label: string; isSystem: boolean }> }>({ income: [], expense: [] })
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showAccountWarning, setShowAccountWarning] = useState(false)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  useEffect(() => {
    if (!isOpen) return
    setLoadingCategories(true)
    categoryService.getAll().then(all => {
      const map = (type: number) => all
        .filter(c => c.type === type && c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(c => ({ value: c.id.toString(), label: c.name, isSystem: c.isSystemDefault }))
      setCategories({ income: map(0), expense: map(1) })
    }).catch(() => setCategories({ income: [], expense: [] }))
      .finally(() => setLoadingCategories(false))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setLoadingAccounts(true)
    accountService.getAccounts()
      .then(accs => setAccounts(accs.filter(a => a.isActive)))
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false))
  }, [isOpen])

  useEffect(() => {
    if (formData.accountId) {
      const acc = accounts.find(a => a.id === parseInt(formData.accountId))
      setSelectedAccount(acc || null)
      setShowAccountWarning(!!acc && formData.type === 'expense' && !!formData.amount && parseFloat(formData.amount) > acc.currentBalance)
    } else {
      setSelectedAccount(null)
      setShowAccountWarning(false)
    }
  }, [formData.accountId, formData.type, formData.amount, accounts])

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'income', amount: transaction.amount?.toString() || '',
        description: transaction.description || '', category: transaction.category || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        status: transaction.status || 'pending', notes: transaction.notes || '',
        accountId: transaction.accountId?.toString() || '',
      })
    } else {
      setFormData({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], status: 'pending', notes: '', accountId: '' })
    }
    setErrors({})
    setShowAccountWarning(false)
  }, [transaction, isOpen])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.amount || parseFloat(formData.amount) <= 0) e.amount = t('errors.amountRequired') || 'Monto requerido'
    if (!formData.description.trim()) e.description = t('errors.descriptionRequired') || 'Descripción requerida'
    if (!formData.category) e.category = t('errors.categoryRequired') || 'Categoría requerida'
    if (!formData.date) e.date = t('errors.dateRequired') || 'Fecha requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...formData,
      type: formData.type as 'income' | 'expense',
      status: formData.status as 'pending' | 'completed',
      amount: parseFloat(formData.amount),
      accountId: formData.accountId ? parseInt(formData.accountId) : undefined,
      id: transaction?.id || Date.now().toString(),
    })
    onClose()
    if (mode === 'create') {
      setFormData({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], status: 'pending', notes: '', accountId: '' })
      setShowAccountWarning(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  if (!isOpen) return null

  const cats = categories[formData.type as 'income' | 'expense']

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? t('new') : tCommon('edit')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('type')}</label>
              <select value={formData.type} onChange={e => handleChange('type', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="income">{t('income')}</option>
                <option value="expense">{t('expense')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('date')}</label>
              <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.date && <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('amount')}</label>
              <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => handleChange('amount', e.target.value)}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00" />
              {errors.amount && <p className="text-red-500 text-xs mt-0.5">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('description')}</label>
            <input type="text" value={formData.description} onChange={e => handleChange('description', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('account')} <span className="text-gray-400 text-xs">({tCommon('no')})</span>
              </label>
              <select value={formData.accountId} onChange={e => handleChange('accountId', e.target.value)}
                disabled={loadingAccounts}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${loadingAccounts ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'}`}>
                <option value="">{loadingAccounts ? tCommon('loading') : t('noAccount')}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.currentBalance)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('category')}</label>
              <select value={formData.category} onChange={e => handleChange('category', e.target.value)}
                disabled={loadingCategories}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'} ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <option value="">{loadingCategories ? tCommon('loading') : tCommon('all')}</option>
                {cats.map(c => <option key={c.value} value={c.value}>{translateCategoryName(c.label, tCategories)}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
            </div>
          </div>

          {selectedAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-800">{tCommon('balance') || 'Balance'}: {formatCurrency(selectedAccount.currentBalance)} {selectedAccount.currency}</p>
            </div>
          )}
          {showAccountWarning && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
              <p className="text-xs text-orange-800">⚠️ {formatCurrency(selectedAccount!.currentBalance - parseFloat(formData.amount || '0'))}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('status')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleChange('status', 'pending')}
                className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${formData.status === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-gray-300'}`}>
                {t('pending')}
              </button>
              <button type="button" onClick={() => handleChange('status', 'completed')}
                className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${formData.status === 'completed' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                {t('completed')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('notes') || 'Notes'} <span className="text-gray-400 text-xs">({tCommon('no')})</span>
            </label>
            <textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)}
              rows={2} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              placeholder="..." />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              {tCommon('cancel')}
            </button>
            <button type="submit" disabled={loadingCategories}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {mode === 'create' ? t('new') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
