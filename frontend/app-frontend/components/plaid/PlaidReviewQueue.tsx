'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Loader2, Tag, FileText, Landmark, X, Trash2
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import {
  getPendingReview, reviewTransaction,
  type PendingTransaction,
} from '@/lib/plaidService'
import { getAll as getCategories, type CategoryDto } from '@/services/categoryService'
import accountService, { type Account, getAccountDisplayName } from '@/services/accountService'

// ─── Config Modal ─────────────────────────────────────────────────────────────

interface ConfigModalProps {
  tx:        PendingTransaction
  categories: CategoryDto[]
  accounts:  Account[]
  onConfirm: (categoryId: number, description: string, accountId: number | null) => void
  onCancel:  () => void
  saving:    boolean
}

function ConfigModal({ tx, categories, accounts, onConfirm, onCancel, saving }: ConfigModalProps) {
  const t = useTranslations('plaid.reviewQueue')
  const locale = useLocale()
  const isExpense    = tx.type === 2
  const relevantCats = categories.filter(c => c.type === (isExpense ? 1 : 0))

  const [categoryId,  setCategoryId]  = useState<number>(tx.categoryId)
  const [description, setDescription] = useState<string>(tx.description ?? tx.merchantName ?? '')
  const [accountId,   setAccountId]   = useState<string>(tx.accountId ? String(tx.accountId) : '')

  useEffect(() => {
    if (accounts.length > 0 && tx.accountId) {
      const exists = accounts.some(a => a.id === tx.accountId)
      setAccountId(exists ? String(tx.accountId) : '')
    }
  }, [accounts, tx.accountId])

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('configTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-12">{t('configSubtitle')}</p>
        </div>

        <div className="mx-6 mt-4 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[220px]">
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
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> {t('configDescription')}
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('configDescPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Tag className="w-3.5 h-3.5" /> {t('configCategory')}
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {(relevantCats.length > 0 ? relevantCats : categories).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Landmark className="w-3.5 h-3.5" /> {t('configAccount')}
              <span className="text-gray-400 font-normal">{t('configAccountOptional')}</span>
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">{t('configNoAccount')}</option>
              {accounts.map(a => (
                <option key={a.id} value={String(a.id)}>{getAccountDisplayName(a, locale)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-5 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('configCancel')}
          </button>
          <button
            onClick={() => onConfirm(categoryId, description, accountId ? Number(accountId) : null)}
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

// ─── Discard Confirm Modal ────────────────────────────────────────────────────

interface DiscardModalProps {
  tx:       PendingTransaction
  onConfirm: () => void
  onCancel:  () => void
  saving:    boolean
}

function DiscardModal({ tx, onConfirm, onCancel, saving }: DiscardModalProps) {
  const t = useTranslations('plaid.reviewQueue')
  const isExpense = tx.type === 2
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('discardTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-12">{t('discardSubtitle')}</p>
        </div>

        {/* Transaction summary */}
        <div className="mx-6 mt-4 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
              {tx.merchantName ?? tx.description ?? 'Transaction'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-base font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
          </span>
        </div>

        <p className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-400">{t('discardBody')}</p>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('discardCancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('discardConfirming')}</>
              : <><Trash2 className="w-4 h-4" /> {t('discardConfirm')}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Row (inside drawer) ─────────────────────────────────────────

interface TxRowProps {
  tx:       PendingTransaction
  onYes:    (tx: PendingTransaction) => void
  onNo:     (tx: PendingTransaction) => void
  disabled: boolean
}

function TxRow({ tx, onYes, onNo, disabled }: TxRowProps) {
  const t = useTranslations('plaid.reviewQueue')
  const isExpense = tx.type === 2
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {tx.merchantName ?? tx.description ?? 'Transaction'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          {tx.institutionName && <> · {tx.institutionName}</>}
        </p>
      </div>
      <span className={`text-sm font-bold shrink-0 ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
        {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onNo(tx)}
          disabled={disabled}
          title={t('btnNoTitle')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
        >
          <XCircle className="w-3.5 h-3.5" /> {t('btnNo')}
        </button>
        <button
          onClick={() => onYes(tx)}
          disabled={disabled}
          title={t('btnYesTitle')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-40"
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
  onTransactionConfirmed?: () => void
}

export default function PlaidReviewQueue({ onCountChange, onTransactionConfirmed }: Props) {
  const t = useTranslations('plaid.reviewQueue')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
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
  const [discardTx,   setDiscardTx]   = useState<PendingTransaction | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

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

  // Cerrar drawer con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

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
    setDiscardTx(tx)
  }

  async function handleDiscardConfirm() {
    if (!discardTx) return
    setSaving(true)
    try {
      await reviewTransaction(discardTx.id, { isBusiness: false })
      const next = pending.filter(p => p.id !== discardTx.id)
      setPending(next)
      const newTotal = totalCount - 1
      setTotalCount(newTotal)
      onCountChange?.(newTotal)
      setDiscardTx(null)
      if (newTotal === 0) setDrawerOpen(false)
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
      await reviewTransaction(configTx.id, { isBusiness: true, categoryId, description, accountId: accountId ?? undefined })
      const next = pending.filter(p => p.id !== configTx.id)
      setPending(next)
      const newTotal = totalCount - 1
      setTotalCount(newTotal)
      onCountChange?.(newTotal)
      setConfigTx(null)
      if (newTotal === 0) setDrawerOpen(false)
      onTransactionConfirmed?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  // No mostrar nada mientras carga (evita flash) ni cuando no hay pendientes
  if (loading && totalCount === 0) return null
  if (!loading && totalCount === 0) return null

  return (
    <>
      {/* ── Banner compacto ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-4 w-48 bg-amber-200 rounded animate-pulse" />
          ) : (
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{totalCount}</span>
              {' '}{t('bannerText')}
            </p>
          )}
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {t('bannerBtn')} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Drawer overlay ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('drawerTitle')}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('drawerSubtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                  {totalCount}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-4 mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg shrink-0">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                  <CheckCircle className="w-12 h-12 mb-3 text-green-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('drawerEmpty')}</p>
                </div>
              ) : (
                <div>
                  {pending.map(tx => (
                    <TxRow key={tx.id} tx={tx} onYes={handleYes} onNo={handleNo} disabled={saving} />
                  ))}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                      >
                        {loadingMore
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />{t('loading')}</>
                          : t('loadMore', { remaining: String(totalCount - pending.length) })
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
              <p className="text-xs text-gray-400 text-center">{t('drawerFooter')}</p>
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Config Modal */}
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

      {/* Discard Modal */}
      {discardTx && (
        <DiscardModal
          tx={discardTx}
          onConfirm={handleDiscardConfirm}
          onCancel={() => setDiscardTx(null)}
          saving={saving}
        />
      )}
    </>
  )
}
