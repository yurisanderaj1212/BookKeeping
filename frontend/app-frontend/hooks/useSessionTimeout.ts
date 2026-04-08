'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getSupabase } from '@/lib/supabaseClient'

const IDLE_MS     = 40 * 60 * 1000   // 40 minutes idle
const ABSOLUTE_MS = 8  * 60 * 60 * 1000  // 8 hours absolute
const WARN_MS     = 60 * 1000         // warn 1 minute before idle logout
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click']
const SESSION_START_KEY = 'cn_session_start'

export interface SessionTimeoutState {
  showWarning: boolean
  secondsLeft: number
  extendSession: () => void
}

export function useSessionTimeout(
  isAuthenticated: boolean,
  onLogout: () => void
): SessionTimeoutState {
  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const absoluteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)

  const doLogout = useCallback(async () => {
    setShowWarning(false)
    localStorage.removeItem(SESSION_START_KEY)
    const supabase = getSupabase()
    await supabase.auth.signOut()
    onLogout()
  }, [onLogout])

  const clearAllTimers = useCallback(() => {
    if (idleTimer.current)     clearTimeout(idleTimer.current)
    if (warnTimer.current)     clearTimeout(warnTimer.current)
    if (countdownRef.current)  clearInterval(countdownRef.current)
  }, [])

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true)
    setSecondsLeft(60)
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(countdownRef.current!)
          doLogout()
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [doLogout])

  const resetIdleTimer = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)
    // Warn 1 min before idle timeout
    warnTimer.current = setTimeout(startWarningCountdown, IDLE_MS - WARN_MS)
    idleTimer.current = setTimeout(doLogout, IDLE_MS)
  }, [clearAllTimers, startWarningCountdown, doLogout])

  const extendSession = useCallback(() => {
    setShowWarning(false)
    if (countdownRef.current) clearInterval(countdownRef.current)
    resetIdleTimer()
  }, [resetIdleTimer])

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers()
      if (absoluteTimer.current) clearTimeout(absoluteTimer.current)
      return
    }

    // Absolute timeout — 8h from session start
    const stored = localStorage.getItem(SESSION_START_KEY)
    const sessionStart = stored ? parseInt(stored) : Date.now()
    if (!stored) localStorage.setItem(SESSION_START_KEY, String(sessionStart))

    const elapsed = Date.now() - sessionStart
    const remaining = ABSOLUTE_MS - elapsed
    if (remaining <= 0) {
      doLogout()
      return
    }
    absoluteTimer.current = setTimeout(doLogout, remaining)

    // Idle timeout
    resetIdleTimer()
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))

    return () => {
      clearAllTimers()
      if (absoluteTimer.current) clearTimeout(absoluteTimer.current)
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer))
    }
  }, [isAuthenticated])

  return { showWarning, secondsLeft, extendSession }
}
