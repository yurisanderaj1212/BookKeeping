'use client'

import { Wallet, CreditCard, Landmark, DollarSign, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Account, AccountType, getAccountDisplayName } from '../../services/accountService'
import { useTranslations, useLocale } from 'next-intl'

interface AccountListProps {
  accounts: Account[]
  onEdit:   (account: Account) => void
  onDelete: (accountId: number) => void
}

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const t      = useTranslations('accounts')
  const locale = useLocale()

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency', currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.Asset:     return Wallet
      case AccountType.Liability: return CreditCard
      case AccountType.Equity:    return Landmark
      case AccountType.Income:    return TrendingUp
      case AccountType.Expense:   return TrendingDown
      default:                    return DollarSign
    }
  }

  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case AccountType.Asset:     return 'bg-blue-100 text-blue-600'
      case AccountType.Liability: return 'bg-red-100 text-red-600'
      case AccountType.Equity:    return 'bg-purple-100 text-purple-600'
      case AccountType.Income:    return 'bg-green-100 text-green-600'
      case AccountType.Expense:   return 'bg-orange-100 text-orange-600'
      default:                    return 'bg-gray-100 text-gray-600'
    }
  }

  // Usar claves i18n para los tipos de cuenta
  const getTypeLabel = (type: AccountType) => t(`types.${type}` as any)
  const getSubTypeLabel = (subType: number) => t(`subTypes.${subType}` as any)

  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type
    if (!groups[type]) groups[type] = []
    groups[type].push(account)
    return groups
  }, {} as Record<AccountType, Account[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedAccounts).map(([typeStr, accountsInGroup]) => {
        const type = Number(typeStr) as AccountType
        const Icon = getAccountIcon(type)
        const colorClass = getAccountColor(type)

        return (
          <div key={type} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{getTypeLabel(type)}</h3>
                <span className="text-sm text-gray-500">({accountsInGroup.length})</span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {accountsInGroup.map((account) => (
                <div key={account.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                  {/* Mobile: stacked layout */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{getAccountDisplayName(account, locale)}</h4>
                        {account.code && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{account.code}</span>
                        )}
                        {!account.isActive && (
                          <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded shrink-0">{t('inactive')}</span>
                        )}
                      </div>
                      {/* Subtype + date — compact on mobile */}
                      <p className="text-xs text-gray-400 truncate">
                        {getSubTypeLabel(account.subType)}
                        <span className="mx-1">·</span>
                        {t('createdOn')} {formatDate(account.createdAt)}
                      </p>
                      {/* Balance — shown inline on mobile */}
                      <p className={`text-sm font-bold mt-1 ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.currentBalance, account.currency)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEdit(account)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title={t('editTitle')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(account.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('deactivateTitle')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
