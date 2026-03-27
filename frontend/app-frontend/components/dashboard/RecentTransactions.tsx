'use client'

import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

export interface RecentTransaction {
  id: string | number
  type: 'income' | 'expense'
  amount: number
  description: string
  categoryName?: string | null
  date: string
  status?: string
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.recentTransactions')
  const tCat = useTranslations('categories')
  const locale = useLocale()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency', currency: 'USD',
    }).format(amount)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric' })
  }

  // Translate category name from Spanish DB name to i18n key
  const translateCategory = (name?: string | null): string => {
    if (!name) return tCat('noCategory')
    const MAP: Record<string, string> = {
      'Ventas': 'income-sales', 'Servicios': 'income-services',
      'Consultoría': 'income-consulting', 'Inversiones': 'income-investments',
      'Otros Ingresos': 'income-other', 'Oficina': 'expense-office-supplies',
      'Marketing': 'expense-marketing', 'Software': 'expense-software',
      'Servicios Públicos': 'expense-utilities', 'Equipos': 'expense-equipment',
      'Viajes': 'expense-travel', 'Servicios Profesionales': 'expense-professional',
      'Alquiler': 'expense-rent', 'Nómina': 'expense-payroll',
      'Otros Gastos': 'expense-other',
    }
    const key = MAP[name]
    if (!key) return name
    try { return tCat(key as any) } catch { return name }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => router.push('/transactions')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>{t('viewAll')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">{t('empty')}</p>
              <p className="text-gray-400 text-xs mt-1">{t('emptyDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.slice(0, 8).map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200 group cursor-pointer"
                style={{ animationDelay: `${index * 60}ms`, animation: 'slideInUp 0.4s ease-out forwards' }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'income'
                      ? <ArrowDownRight className="w-4 h-4 text-green-600" />
                      : <ArrowUpRight className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {translateCategory(tx.categoryName)}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
