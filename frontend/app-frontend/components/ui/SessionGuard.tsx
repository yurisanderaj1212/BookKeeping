'use client'

import { useAuth } from '@/hooks/useAuth'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useRouter } from 'next/navigation'
import SessionWarningModal from '@/components/ui/SessionWarningModal'

export default function SessionGuard() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.replace('/auth/login')
  }

  const { showWarning, secondsLeft, extendSession } = useSessionTimeout(isAuthenticated, handleLogout)

  if (!showWarning) return null

  return (
    <SessionWarningModal
      secondsLeft={secondsLeft}
      onExtend={extendSession}
      onLogout={handleLogout}
    />
  )
}
