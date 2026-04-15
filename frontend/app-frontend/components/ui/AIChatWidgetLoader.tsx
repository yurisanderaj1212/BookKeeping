'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'

// Lazy load the chat widget to avoid adding to initial bundle
const AIChatWidget = dynamic(() => import('@/components/ui/AIChatWidget'), { ssr: false })

// Pages where the chat should NOT appear
const EXCLUDED_PATHS = ['/auth/', '/subscribe', '/pricing', '/privacy', '/terms', '/cookies']

export default function AIChatWidgetLoader() {
  const pathname  = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  // Don't show on auth pages, landing sections, or while loading
  const isExcluded = EXCLUDED_PATHS.some(p => pathname.includes(p))
  const isLanding  = pathname === '/' || pathname === '/en' || pathname === '/es'

  if (isLoading || !isAuthenticated || isExcluded || isLanding) return null

  return <AIChatWidget />
}
