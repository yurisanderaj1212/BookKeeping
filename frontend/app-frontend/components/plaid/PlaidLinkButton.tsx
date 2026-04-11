'use client'

import { useState, useEffect, useRef } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Landmark, Loader2 } from 'lucide-react'
import { createLinkToken, exchangeToken } from '@/lib/plaidService'
import { useTranslations } from 'next-intl'
import PlaidHistoryModal, { type HistoryOption } from '@/components/plaid/PlaidHistoryModal'

interface Props {
  onSuccess:    () => void
  onError?:     (msg: string) => void
  'data-tour'?: string
}

export default function PlaidLinkButton({ onSuccess, onError, 'data-tour': dataTour }: Props) {
  const t = useTranslations('accounts.connectedBanks')
  const [linkToken, setLinkToken]   = useState<string | null>(null)
  const [preparing, setPreparing]   = useState(false)
  const [exchanging, setExchanging] = useState(false)
  const openedRef = useRef(false)

  // Pending data from Plaid onSuccess — held until user picks history option
  const [pendingExchange, setPendingExchange] = useState<{
    publicToken: string
    institutionId: string | null
    institutionName: string | null
  } | null>(null)

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: (publicToken, metadata) => {
      // Don't exchange yet — show history picker first
      setPendingExchange({
        publicToken,
        institutionId:   metadata.institution?.institution_id ?? null,
        institutionName: metadata.institution?.name ?? null,
      })
      setLinkToken(null)
      openedRef.current = false
    },
    onExit: () => {
      setLinkToken(null)
      openedRef.current = false
    },
  })

  useEffect(() => {
    if (ready && linkToken && !openedRef.current) {
      openedRef.current = true
      open()
    }
  }, [ready, linkToken, open])

  async function handleClick() {
    if (preparing || linkToken || exchanging) return
    setPreparing(true)
    openedRef.current = false
    try {
      const { linkToken: token } = await createLinkToken()
      setLinkToken(token)
      sessionStorage.setItem('plaid_link_token', token)
    } catch (e: unknown) {
      onError?.(e instanceof Error ? e.message : t('errInit'))
    } finally {
      setPreparing(false)
    }
  }

  async function handleHistoryConfirm(_option: HistoryOption, startDate: string | null) {
    if (!pendingExchange) return
    setPendingExchange(null)
    setExchanging(true)
    try {
      await exchangeToken(
        pendingExchange.publicToken,
        pendingExchange.institutionId,
        pendingExchange.institutionName,
        startDate,
      )
      sessionStorage.removeItem('plaid_link_token')
      onSuccess()
    } catch (e: unknown) {
      onError?.(e instanceof Error ? e.message : t('errConnect'))
    } finally {
      setExchanging(false)
    }
  }

  function handleHistoryCancel() {
    // User cancelled — discard the pending exchange, don't connect
    setPendingExchange(null)
    sessionStorage.removeItem('plaid_link_token')
  }

  const isLoading = preparing || exchanging

  return (
    <>
      <button
        onClick={handleClick}
        data-tour={dataTour}
        disabled={isLoading || !!linkToken || !!pendingExchange}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        {preparing  && <><Loader2 className="w-4 h-4 animate-spin" /> {t('btnPreparing')}</>}
        {exchanging  && <><Loader2 className="w-4 h-4 animate-spin" /> {t('btnConnecting')}</>}
        {!isLoading  && <><Landmark className="w-4 h-4" /> {t('btnConnect')}</>}
      </button>

      {pendingExchange && (
        <PlaidHistoryModal
          institutionName={pendingExchange.institutionName}
          onConfirm={handleHistoryConfirm}
          onCancel={handleHistoryCancel}
        />
      )}
    </>
  )
}
