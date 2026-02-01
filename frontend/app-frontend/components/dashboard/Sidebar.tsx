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
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight
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
    id: 'employees',
    label: 'Empleados',
    icon: Users,
    href: '/employees'
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: FileText,
    href: '/reports'
  },
  {
    id: 'analytics',
    label: 'Análisis',
    icon: BarChart3,
    href: '/analytics'
  },
  {
    id: 'week-close',
    label: 'Cierre Semanal',
    icon: Calendar,
    href: '/week-close'
  }
]

const settingsItems: MenuItem[] = [
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    href: '/notifications'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    href: '/settings'
  }
]

interface SidebarProps {
  onLogout: () => void
  onToggle?: (isCollapsed: boolean) => void
}

export default function Sidebar({ onLogout, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggle?.(newCollapsedState)
  }

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      data-tour="sidebar"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chill Numbers</h1>
              <p className="text-xs text-gray-500">Pro</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors ${
            isCollapsed ? 'mx-auto mt-2' : ''
          }`}
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation - Flex-1 para ocupar el espacio disponible */}
      <nav className="flex-1 px-3 py-4 flex flex-col">
        {/* Main Menu */}
        <div className="flex-1">
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
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Settings Section - Más cerca del perfil */}
        <div className="border-t border-gray-200 pt-3 flex-shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sistema
            </p>
          )}
          <ul className="space-y-1">
            {settingsItems.map((item) => {
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
                    title={isCollapsed ? item.label : undefined}
                    data-tour={item.id === 'settings' ? 'settings-link' : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* User section - Más cerca de la sección Sistema */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-2 p-2.5 rounded-lg bg-gray-50">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
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
              <LogOut className="w-4 h-4 group-hover:text-red-600 flex-shrink-0" />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}