'use client'

import { useState } from 'react'
import { Calendar, Clock, X, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type HistoryOption = '3months' | '2months' | '1month' | 'current' | 'none'

interface PlaidHistoryModalProps {
  institutionName: string | null
  onConfirm: (option: HistoryOption, startDate: string | null) => void
  onCancel: () => void
}

function getStartDate(option: HistoryOption): string | null {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  switch (option) {
    case 'none':
      return today  // start from today — no historical transactions
    case '3months': {
      const d = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
    }
    case '2months': {
      const d = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
    }
    case '1month': {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
    }
    case 'current': {
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
    }
  }
}

export default function PlaidHistoryModal({ institutionName, onConfirm, onCancel }: PlaidHistoryModalProps) {
  const t = useTranslations('accounts.plaidHistory')
  const [selected, setSelected] = useState<HistoryOption>('current')

  const options: { value: HistoryOption; icon: typeof Clock; color: string }[] = [
    { value: '3months', icon: Calendar, color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' },
    { value: '2months', icon: Calendar, color: 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800' },
    { value: '1month',  icon: Calendar, color: 'border-violet-200 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-800' },
    { value: 'current', icon: Clock,    color: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' },
    { value: 'none',    icon: X,        color: 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700' },
  ]

  const handleConfirm = () => {
    onConfirm(selected, getStartDate(selected))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
              {institutionName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{institutionName}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{t('subtitle')}</p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map(({ value, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                selected === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                  : `${color} hover:border-gray-300 dark:hover:border-gray-600`
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                selected === value ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${selected === value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {t(`option.${value}.label`)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(`option.${value}.desc`)}
                </p>
              </div>
              {selected === value && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {t('confirm')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
