'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import { getPlaidItems, syncItem, removeItem, type PlaidItemInfo } from '@/lib/plaidService'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'

export default function ConnectedBanks({ refreshKey }: { refreshKey?: number }) {
  const t = useTranslations('accounts.connectedBanks')
  const tCommon = useTranslations('common')
  const { showSuccess, showError } = useNotifications()

  const [items, setItems]     = useState<PlaidItemInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)

  const isPlaidEnabled = !!process.env.NEXT_PUBLIC_PLAID_CLIENT_ID

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await getPlaidItems())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('toastLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load, refreshKey])

  if (!isPlaidEnabled) return null

  async function handleSync(id: number) {
    setSyncing(id)
    try {
      const r = await syncItem(id)
      showSuccess(tCommon('success'), t('toastSynced', { added: r.added, modified: r.modified }))
    } catch (e: unknown) {
      showError(tCommon('error'), e instanceof Error ? e.message : t('toastSyncError'))
    } finally {
      setSyncing(null)
    }
  }

  async function handleRemove(id: number) {
    if (!confirm(t('confirmRemove'))) return
    setRemoving(id)
    try {
      await removeItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
      showSuccess(tCommon('success'), t('toastDisconnected'))
    } catch (e: unknown) {
      showError(tCommon('error'), e instanceof Error ? e.message : t('toastRemoveError'))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t('empty')}</p>
          <p className="text-xs mt-1">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:border-gray-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.institutionName ?? 'Banco conectado'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('connectedOn')} {new Date(item.createdAt).toLocaleDateString(undefined)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSync(item.id)}
                  disabled={syncing === item.id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                  title={t('syncTitle')}
                >
                  <RefreshCw className={`w-4 h-4 ${syncing === item.id ? 'animate-spin' : ''}`} />
                  <span>{syncing === item.id ? '...' : t('syncTitle')}</span>
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title={t('removeTitle')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
