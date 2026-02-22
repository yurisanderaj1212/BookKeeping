'use client'

import { Wallet, CreditCard, Landmark, DollarSign, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Account, AccountType, AccountTypeLabels, AccountSubTypeLabels } from '../../services/accountService'

interface AccountListProps {
  accounts: Account[]
  onEdit: (account: Account) => void
  onDelete: (accountId: number) => void
}

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.Asset:
        return Wallet
      case AccountType.Liability:
        return CreditCard
      case AccountType.Equity:
        return Landmark
      case AccountType.Income:
        return TrendingUp
      case AccountType.Expense:
        return TrendingDown
      default:
        return DollarSign
    }
  }

  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case AccountType.Asset:
        return 'bg-blue-100 text-blue-600'
      case AccountType.Liability:
        return 'bg-red-100 text-red-600'
      case AccountType.Equity:
        return 'bg-purple-100 text-purple-600'
      case AccountType.Income:
        return 'bg-green-100 text-green-600'
      case AccountType.Expense:
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Agrupar cuentas por tipo
  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type
    if (!groups[type]) {
      groups[type] = []
    }
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
            {/* Group Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {AccountTypeLabels[type]}
                </h3>
                <span className="text-sm text-gray-500">
                  ({accountsInGroup.length})
                </span>
              </div>
            </div>

            {/* Accounts in Group */}
            <div className="divide-y divide-gray-200">
              {accountsInGroup.map((account) => (
                <div
                  key={account.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Account Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {account.name}
                        </h4>
                        {account.code && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {account.code}
                          </span>
                        )}
                        {!account.isActive && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            Inactiva
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{AccountSubTypeLabels[account.subType]}</span>
                        <span>•</span>
                        <span>Creada: {formatDate(account.createdAt)}</span>
                        {account.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{account.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Balance and Actions */}
                    <div className="flex items-center space-x-4 ml-4">
                      {/* Balance */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Balance Actual</p>
                        <p className={`text-lg font-semibold ${
                          account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(account.currentBalance, account.currency)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(account)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar cuenta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(account.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desactivar cuenta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
