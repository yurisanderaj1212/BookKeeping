'use client'

import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'

/**
 * Wraps page main content with the correct responsive left margin
 * based on sidebar collapsed state.
 *
 * On mobile (<lg): always ml-16 (sidebar is always collapsed)
 * On desktop: ml-16 when collapsed, ml-64 when expanded
 */
export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarCollapsed()

  return (
    <div className={`flex-1 transition-all duration-300 min-w-0 ${
      isCollapsed ? 'ml-16' : 'lg:ml-64 ml-16'
    }`}>
      {children}
    </div>
  )
}
