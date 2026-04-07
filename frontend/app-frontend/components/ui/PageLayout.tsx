'use client'

import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'

/**
 * Wraps page main content with the correct left margin.
 *
 * Mobile (<lg):  always ml-0 — sidebar is a drawer, doesn't take space
 * Desktop (lg+): ml-16 when collapsed, ml-64 when expanded
 */
export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarCollapsed()

  return (
    <div className={`flex-1 min-w-0 transition-all duration-300 bg-gray-50 dark:bg-gray-950 ${
      isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
    }`}>
      {children}
    </div>
  )
}
