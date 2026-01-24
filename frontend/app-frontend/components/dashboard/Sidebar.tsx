'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Crown,
  LogOut,
  User,
  Tag
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Resumen',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    id: 'transactions',
    label: 'Transacciones',
    icon: Receipt,
    href: '/transactions'
  },
  {
    id: 'categories',
    label: 'Categorías',
    icon: Tag,
    href: '/categories'
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: FileText,
    href: '/dashboard/reports'
  },
  {
    id: 'analytics',
    label: 'Análisis',
    icon: BarChart3,
    href: '/dashboard/analytics'
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Crown,
    href: '/dashboard/admin'
  },
  {
    id: 'membership',
    label: 'Membresía',
    icon: Users,
    href: '/dashboard/membership'
  }
]

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CN</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Chill Numbers</h1>
          <p className="text-xs text-gray-500">Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-600" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}