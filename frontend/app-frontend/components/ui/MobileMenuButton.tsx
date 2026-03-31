'use client'

import { Menu } from 'lucide-react'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'

/**
 * Hamburger button — only visible on mobile (lg:hidden).
 * Toggles the sidebar drawer.
 */
export default function MobileMenuButton() {
  const { toggle } = useSidebarCollapsed()

  return (
    <button
      onClick={toggle}
      className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors mr-1"
      aria-label="Abrir menú"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
