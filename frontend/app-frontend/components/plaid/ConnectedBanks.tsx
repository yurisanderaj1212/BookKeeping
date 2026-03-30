'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { getPlaidItems, syncItem, removeItem, type PlaidItemInfo } from '@/lib/plaidService'
import PlaidLinkButton from './PlaidLinkButton'
import { useTranslations } from 'next-intl'

export default function ConnectedBanks({ refreshKey }: { refreshKey?: number }) {
  const t = useTranslations('accounts.connectedBanks')

  if (!process.env.NEXT_PUBLIC_PLAID_CLIENT_ID) return null
  const [items, setItems]     = useState<PlaidItemInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

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

  async function handleSync(id: number) {
    setSyncing(id)
    try {
      const r = await syncItem(id)
      showToast(t('toastSynced', { added: r.added, modified: r.modified }))
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('toastSyncError'), false)
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
      showToast(t('toastDisconnected'))
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t('toastRemoveError'), false)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{t('title')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('subtitle')}</p>
        </div>
        <PlaidLinkButton
          onSuccess={() => { load(); showToast(t('toastConnected')) }}
          onError={msg => showToast(msg, false)}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
          toast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.ok
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
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
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
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
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title={t('syncTitle')}
                >
                  <RefreshCw className={`w-4 h-4 ${syncing === item.id ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
