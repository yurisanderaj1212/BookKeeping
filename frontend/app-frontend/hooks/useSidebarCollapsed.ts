'use client'

import { useState, useEffect } from 'react'

const KEY   = 'sidebar-collapsed'
const EVENT = 'sidebar-toggle'

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // On mobile (<1024px) always start collapsed
    const isMobile = window.innerWidth < 1024
    const saved    = localStorage.getItem(KEY) === '1'
    const initial  = isMobile ? true : saved
    setIsCollapsed(initial)

    const handler = (e: Event) => {
      const next = (e as CustomEvent<boolean>).detail
      setTimeout(() => setIsCollapsed(next), 0)
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  const toggle = () => {
    setIsCollapsed(prev => {
      const next = !prev
      // Only persist on desktop — mobile always resets
      if (window.innerWidth >= 1024) {
        localStorage.setItem(KEY, next ? '1' : '0')
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: next }))
      }, 0)
      return next
    })
  }

  return { isCollapsed, toggle }
}
