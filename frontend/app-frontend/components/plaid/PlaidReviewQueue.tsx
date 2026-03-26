'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Loader2, Tag, FileText, Landmark
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  getPendingReview, reviewTransaction,
  type PendingTransaction,
} from '@/lib/plaidService'
import { getAll as getCategories, type CategoryDto } from '@/services/categoryService'
import accountService, { type Account } from '@/services/accountService'

// ─── Config Modal ─────────────────────────────────────────────────────────────

interface ConfigModalProps {
  tx:         PendingTransaction
  categories: CategoryDto[]
  accounts:   Account[]
  onConfirm:  (categoryId: number, description: string, accountId: number | null) => void
  onCancel:   () => void
  saving:     boolean
}

function ConfigModal({ tx, categories, accounts, onConfirm, onCancel, saving }: ConfigModalProps) {
  const t = useTranslations('plaid.reviewQueue')
  // tx.type: TransactionType enum (Income=1, Expense=2)
  // c.type: raw DB value (0=Income, 1=Expense)
  const isExpense = tx.type === 2
  const relevantCats = categories.filter(c => c.type === (isExpense ? 1 : 0))

  const [categoryId,  setCategoryId]  = useState<number>(tx.categoryId)
  const [description, setDescription] = useState<string>(tx.description ?? tx.merchantName ?? '')
  const [accountId,   setAccountId]   = useState<number | null>(tx.accountId ?? null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">{t('configTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 ml-12">{t('configSubtitle')}</p>
        </div>

        {/* Transaction summary */}
        <div className="mx-6 mt-4 mb-4 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
              {tx.merchantName ?? tx.description ?? 'Transaction'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {tx.institutionName && ` · ${tx.institutionName}`}
            </p>
          </div>
          <span className={`text-base font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
          </span>
        </div>

        <div className="px-6 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> {t('configDescription')}
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('configDescPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
              <Tag className="w-3.5 h-3.5" /> {t('configCategory')}
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {(relevantCats.length > 0 ? relevantCats : categories).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
              <Landmark className="w-3.5 h-3.5" /> {t('configAccount')}
              <span className="text-gray-400 font-normal">{t('configAccountOptional')}</span>
            </label>
            <select
              value={accountId ?? ''}
              onChange={e => setAccountId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">{t('configNoAccount')}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-5 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('configCancel')}
          </button>
          <button
            onClick={() => onConfirm(categoryId, description, accountId)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('configSaving')}</>
              : <><CheckCircle className="w-4 h-4" /> {t('configConfirm')}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Card ─────────────────────────────────────────────────────────

interface TxCardProps {
  tx:       PendingTransaction
  onYes:    (tx: PendingTransaction) => void
  onNo:     (tx: PendingTransaction) => void
  disabled: boolean
}

function TxCard({ tx, onYes, onNo, disabled }: TxCardProps) {
  const t = useTranslations('plaid.reviewQueue')
  const isExpense = tx.type === 2
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {tx.merchantName ?? tx.description ?? 'Transaction'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          {tx.institutionName && <> · <span>{tx.institutionName}</span></>}
          {' · '}<span className="text-gray-500">{tx.category}</span>
        </p>
      </div>
      <span className={`text-sm font-bold shrink-0 ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
        {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onNo(tx)}
          disabled={disabled}
          title={t('btnNoTitle')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
        >
          <XCircle className="w-3.5 h-3.5" /> {t('btnNo')}
        </button>
        <button
          onClick={() => onYes(tx)}
          disabled={disabled}
          title={t('btnYesTitle')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-40"
        >
          <ChevronRight className="w-3.5 h-3.5" /> {t('btnYes')}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onCountChange?: (count: number) => void
}

export default function PlaidReviewQueue({ onCountChange }: Props) {
  const t = useTranslations('plaid.reviewQueue')
  const [pending,     setPending]     = useState<PendingTransaction[]>([])
  const [categories,  setCategories]  = useState<CategoryDto[]>([])
  const [accounts,    setAccounts]    = useState<Account[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [page,        setPage]        = useState(1)
  const [totalCount,  setTotalCount]  = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [configTx,    setConfigTx]    = useState<PendingTransaction | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [res, cats, accs] = await Promise.all([
        getPendingReview(1, 25),
        getCategories(),
        accountService.getAccounts(),
      ])
      setPending(res.data)
      setTotalCount(res.totalCount)
      setHasMore(res.hasMore)
      setPage(1)
      setCategories(cats)
      setAccounts(accs)
      onCountChange?.(res.totalCount)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [onCountChange, t])

  useEffect(() => { load() }, [load])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await getPendingReview(nextPage, 25)
      setPending(prev => [...prev, ...res.data])
      setHasMore(res.hasMore)
      setPage(nextPage)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('loadMoreError'))
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleNo(tx: PendingTransaction) {
    setSaving(true)
    try {
      await reviewTransaction(tx.id, { isBusiness: false })
      const next = pending.filter(t => t.id !== tx.id)
      setPending(next)
      const newTotal = totalCount - 1
      setTotalCount(newTotal)
      onCountChange?.(newTotal)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  function handleYes(tx: PendingTransaction) {
    setConfigTx(tx)
  }

  async function handleConfirm(categoryId: number, description: string, accountId: number | null) {
    if (!configTx) return
    setSaving(true)
    try {
      await reviewTransaction(configTx.id, {
        isBusiness: true,
        categoryId,
        description,
        accountId: accountId ?? undefined,
      })
      const next = pending.filter(t => t.id !== configTx.id)
      setPending(next)
      const newTotal = totalCount - 1
      setTotalCount(newTotal)
      onCountChange?.(newTotal)
      setConfigTx(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (pending.length === 0 && totalCount === 0) return null

  return (
    <>
      <div className="bg-white rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {t('title')}
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                {totalCount}
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-2">
          {pending.map(tx => (
            <TxCard key={tx.id} tx={tx} onYes={handleYes} onNo={handleNo} disabled={saving} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? t('loading') : t('loadMore', { remaining: String(totalCount - pending.length) })}
            </button>
          </div>
        )}
      </div>

      {configTx && (
        <ConfigModal
          tx={configTx}
          categories={categories}
          accounts={accounts}
          onConfirm={handleConfirm}
          onCancel={() => setConfigTx(null)}
          saving={saving}
        />
      )}
    </>
  )
}
