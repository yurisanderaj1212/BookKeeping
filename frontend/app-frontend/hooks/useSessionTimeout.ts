'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getSupabase } from '@/lib/supabaseClient'

const IDLE_MS     = 40 * 60 * 1000  // 40 minutes idle
const ABSOLUTE_MS = 8  * 60 * 60 * 1000  // 8 hours absolute
const WARN_BEFORE = 60 * 1000        // show warning 1 minute before logout
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
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)

  // Use refs so callbacks always have latest values without causing re-renders
  const onLogoutRef       = useRef(onLogout)
  const showWarningRef    = useRef(showWarning)
  const idleTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const absoluteTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const isAuthRef         = useRef(isAuthenticated)

  // Keep refs in sync
  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])
  useEffect(() => { showWarningRef.current = showWarning }, [showWarning])
  useEffect(() => { isAuthRef.current = isAuthenticated }, [isAuthenticated])

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current)  { clearTimeout(idleTimerRef.current);  idleTimerRef.current  = null }
    if (warnTimerRef.current)  { clearTimeout(warnTimerRef.current);  warnTimerRef.current  = null }
    clearCountdown()
  }, [clearCountdown])

  const doLogout = useCallback(async () => {
    clearIdleTimers()
    if (absoluteTimerRef.current) { clearTimeout(absoluteTimerRef.current); absoluteTimerRef.current = null }
    setShowWarning(false)
    localStorage.removeItem(SESSION_START_KEY)
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch { /* silencioso */ }
    onLogoutRef.current()
  }, [clearIdleTimers])

  const startWarning = useCallback(() => {
    clearCountdown()
    setShowWarning(true)
    setSecondsLeft(60)
    let secs = 60
    countdownRef.current = setInterval(() => {
      secs -= 1
      setSecondsLeft(secs)
      if (secs <= 0) {
        clearCountdown()
        doLogout()
      }
    }, 1000)
  }, [clearCountdown, doLogout])

  const resetIdleTimer = useCallback(() => {
    // Don't reset if warning is already showing — let it count down
    if (showWarningRef.current) return
    clearIdleTimers()
    warnTimerRef.current = setTimeout(startWarning, IDLE_MS - WARN_BEFORE)
    idleTimerRef.current = setTimeout(doLogout, IDLE_MS)
  }, [clearIdleTimers, startWarning, doLogout])

  const extendSession = useCallback(() => {
    clearCountdown()
    setShowWarning(false)
    // Small delay to ensure state is updated before resetting timers
    setTimeout(() => {
      showWarningRef.current = false
      resetIdleTimer()
    }, 50)
  }, [clearCountdown, resetIdleTimer])

  useEffect(() => {
    if (!isAuthenticated) {
      clearIdleTimers()
      if (absoluteTimerRef.current) { clearTimeout(absoluteTimerRef.current); absoluteTimerRef.current = null }
      setShowWarning(false)
      return
    }

    // Absolute timeout — 8h from session start
    const stored = localStorage.getItem(SESSION_START_KEY)
    const sessionStart = stored ? parseInt(stored) : Date.now()
    if (!stored) localStorage.setItem(SESSION_START_KEY, String(sessionStart))

    const elapsed   = Date.now() - sessionStart
    const remaining = ABSOLUTE_MS - elapsed
    if (remaining <= 0) {
      doLogout()
      return
    }
    absoluteTimerRef.current = setTimeout(doLogout, remaining)

    // Start idle timer
    resetIdleTimer()

    // Activity listeners reset the idle timer
    const handleActivity = () => resetIdleTimer()
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    return () => {
      clearIdleTimers()
      if (absoluteTimerRef.current) { clearTimeout(absoluteTimerRef.current); absoluteTimerRef.current = null }
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return { showWarning, secondsLeft, extendSession }
}
