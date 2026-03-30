'use client'

import { useState, useEffect, useRef } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Landmark, Loader2 } from 'lucide-react'
import { createLinkToken, exchangeToken } from '@/lib/plaidService'
import { useTranslations } from 'next-intl'

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
  // Evita que StrictMode doble-invocación abra Plaid dos veces
  const openedRef = useRef(false)

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: async (publicToken, metadata) => {
      setExchanging(true)
      try {
        await exchangeToken(
          publicToken,
          metadata.institution?.institution_id ?? null,
          metadata.institution?.name ?? null
        )
        onSuccess()
      } catch (e: unknown) {
        onError?.(e instanceof Error ? e.message : t('errConnect'))
      } finally {
        setExchanging(false)
        setLinkToken(null)
        openedRef.current = false
      }
    },
    onExit: () => {
      setLinkToken(null)
      openedRef.current = false
    },
  })

  // Abrir Plaid en cuanto el token esté listo — solo una vez por token
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
    } catch (e: unknown) {
      onError?.(e instanceof Error ? e.message : t('errInit'))
    } finally {
      setPreparing(false)
    }
  }

  const isLoading = preparing || exchanging

  return (
    <button
      onClick={handleClick}
      data-tour={dataTour}
      disabled={isLoading || !!linkToken}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
    >
      {preparing  && <><Loader2 className="w-4 h-4 animate-spin" /> {t('btnPreparing')}</>}
      {exchanging  && <><Loader2 className="w-4 h-4 animate-spin" /> {t('btnConnecting')}</>}
      {!isLoading  && <><Landmark className="w-4 h-4" /> {t('btnConnect')}</>}
    </button>
  )
}
