'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Account, CreateAccountDto, AccountType, AccountSubType, getSubTypesForType,
} from '../../services/accountService'
import { useTranslations } from 'next-intl'

interface AccountFormProps {
  isOpen:   boolean
  onClose:  () => void
  onSave:   (account: CreateAccountDto, accountId?: number) => Promise<void>
  account?: Account | null
  mode?:    'create' | 'edit'
}

export default function AccountForm({ isOpen, onClose, onSave, account }: AccountFormProps) {
  const t = useTranslations('accounts')

  const [formData, setFormData] = useState<CreateAccountDto>({
    name: '', code: '', type: AccountType.Asset, subType: AccountSubType.BankAccount,
    initialBalance: 0, description: '', currency: 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [availableSubTypes, setAvailableSubTypes] = useState<AccountSubType[]>([])

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name, code: account.code || '', type: account.type,
        subType: account.subType, initialBalance: account.currentBalance,
        description: account.description || '', currency: account.currency,
      })
    } else {
      setFormData({ name: '', code: '', type: AccountType.Asset, subType: AccountSubType.BankAccount, initialBalance: 0, description: '', currency: 'USD' })
    }
  }, [account, isOpen])

  useEffect(() => {
    const subTypes = getSubTypesForType(formData.type)
    setAvailableSubTypes(subTypes)
    if (subTypes.length > 0 && (!formData.subType || !subTypes.includes(formData.subType as AccountSubType))) {
      setFormData(prev => ({ ...prev, subType: subTypes[0] }))
    }
  }, [formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.name.trim()) { setError(t('form.nameRequired')); return }
    if ((formData.initialBalance ?? 0) < 0) { setError(t('form.balanceNegative')); return }
    try {
      setLoading(true)
      await onSave(formData, account?.id)
      onClose()
    } catch (err: any) {
      setError(err.message || t('form.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateAccountDto, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-9999 overflow-y-auto flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white px-5 py-3 border-b border-gray-200 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">
              {account ? t('form.editTitle') : t('form.title')}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white px-5 py-3 space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Cuenta Corriente Banco XYZ" required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={e => handleChange('type', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {([1,2,3,4,5] as AccountType[]).map(v => (
                    <option key={v} value={v}>{t(`types.${v}` as any)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.subType')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subType}
                  onChange={e => handleChange('subType', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {availableSubTypes.map(st => (
                    <option key={st} value={st}>{t(`subTypes.${st}` as any)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('form.initialBalance')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-sm text-gray-500">$</span>
                  <input
                    type="number" step="0.01"
                    value={formData.initialBalance}
                    onChange={e => handleChange('initialBalance', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.code')} <span className="text-gray-400 text-xs">{t('form.codeOptional')}</span>
                </label>
                <input
                  type="text" value={formData.code}
                  onChange={e => handleChange('code', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: 1010" maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('form.currency')}</label>
              <select
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {(['USD','EUR','MXN','COP'] as const).map(c => (
                  <option key={c} value={c}>{t(`currencies.${c}` as any)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('form.description')} <span className="text-gray-400 text-xs">{t('form.descriptionOptional')}</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder={t('form.descriptionPlaceholder')} maxLength={500}
              />
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 rounded-b-lg sticky bottom-0">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('form.save') : account ? t('form.update') : t('form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
