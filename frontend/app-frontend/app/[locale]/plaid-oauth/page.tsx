'use client'

import { useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Loader2 } from 'lucide-react'

// This page handles the OAuth redirect from banks like Capital One, Chase, etc.
// Plaid redirects back here after the user authenticates with their bank.
// The received_redirect_uri is passed back to Plaid Link to complete the flow.
export default function PlaidOAuthPage() {
  // On mount, re-initialize Plaid Link with the received_redirect_uri
  // The link token was stored in sessionStorage before the OAuth redirect
  const storedToken = typeof window !== 'undefined'
    ? sessionStorage.getItem('plaid_link_token')
    : null

  const { open, ready } = usePlaidLink({
    token: storedToken ?? '',
    receivedRedirectUri: typeof window !== 'undefined' ? window.location.href : '',
    onSuccess: async (publicToken, metadata) => {
      try {
        const { exchangeToken } = await import('@/lib/plaidService')
        await exchangeToken(
          publicToken,
          metadata.institution?.institution_id ?? null,
          metadata.institution?.name ?? null,
        )
        sessionStorage.removeItem('plaid_link_token')
        window.location.href = '/accounts'
      } catch {
        window.location.href = '/accounts?plaid_error=1'
      }
    },
    onExit: () => {
      sessionStorage.removeItem('plaid_link_token')
      window.location.href = '/accounts'
    },
  })

  useEffect(() => {
    if (ready && storedToken) open()
  }, [ready, storedToken, open])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Connecting your bank account...</p>
      </div>
    </div>
  )
}
