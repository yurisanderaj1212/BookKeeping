'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCurrency } from '@/hooks/useCurrency'
import { getSupabase } from '@/lib/supabaseClient'
import { translateCategoryName } from '@/lib/categoryTranslator'

interface TopTransactionsProps {
  period: string
  year:   string
  month:  string
}

interface TxRow {
  id:          number
  type:        number
  amount:      number
  description: string
  date:        string
  status:      number
  category_name?: string
}

function getPeriodDates(period: string, year: string, month: string) {
  const now = new Date()
  if (period === 'week') {
    const day = now.getDay()
    const start = new Date(now); start.setDate(now.getDate() - day)
    const end   = new Date(start); end.setDate(start.getDate() + 6)
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
  }
  if (period === 'month') {
    const m = parseInt(month), y = parseInt(year)
    return { start: `${y}-${String(m).padStart(2,'0')}-01`, end: new Date(y, m, 0).toISOString().split('T')[0] }
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

export default function TopTransactions({ period, year, month }: TopTransactionsProps) {
  const t          = useTranslations('analytics.topTransactions')
  const tCategories = useTranslations('categories')
  const locale     = useLocale()
  const { formatCurrency } = useCurrency()
  const [rows, setRows]       = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { start, end } = getPeriodDates(period, year, month)
        const { data } = await supabase
          .from('transactions')
          .select('id, type, amount, description, date, status, categories(name)')
          .gte('date', start).lte('date', end)
          .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
          .order('amount', { ascending: false })
          .limit(50)
        if (!cancelled) setRows((data ?? []).map((r: any) => ({ ...r, category_name: r.categories?.name })))
      } catch { /* silencioso */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [period, year, month])

  const top10    = rows.slice(0, 10)
  const topIncome   = rows.filter(r => r.type === 1).slice(0, 5)
  const topExpenses = rows.filter(r => r.type === 2).slice(0, 5)

  const StatusBadge = ({ status }: { status: number }) => (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
      status === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {status === 0 ? t('statusCompleted') : t('statusPending')}
    </span>
  )

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
    </div>
  )

  if (rows.length === 0) return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{t('noData')}</p>
    </div>
  )

  return (
    <div className="space-y-6 mb-8">
      {/* Top 10 overall */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>{t('sortedByAmount')}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-[8%]  px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('colRank')}</th>
                <th className="w-[40%] px-4 py-3 text-left   text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('colDescription')}</th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('colDate')}</th>
                <th className="w-[20%] px-4 py-3 text-right  text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('colAmount')}</th>
                <th className="w-[17%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {top10.map((tx, i) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${i < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{i+1}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {tx.type === 1
                        ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        : <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tx.description}</p>
                        {tx.category_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{translateCategoryName(tx.category_name, tCategories)}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${tx.type === 1 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {tx.type === 1 ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Income vs Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { label: t('topIncome'),   data: topIncome,   color: 'green', icon: ArrowUpRight,   sign: '+' },
          { label: t('topExpenses'), data: topExpenses, color: 'red',   icon: ArrowDownRight, sign: '-' },
        ].map(({ label, data, color, icon: Icon, sign }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{label}</h4>
              <div className={`bg-${color}-100 p-1 rounded-full`}><Icon className={`w-4 h-4 text-${color}-600`} /></div>
            </div>
            <div className="space-y-3">
              {data.map((tx, i) => (
                <div key={tx.id} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 bg-${color}-100 rounded-full flex items-center justify-center text-xs font-bold text-${color}-800`}>{i+1}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold text-${color}-700`}>{sign}{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('totalTop5')}</span>
              <span className={`text-lg font-bold text-${color}-700`}>
                {sign}{formatCurrency(data.reduce((s, tx) => s + tx.amount, 0))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


