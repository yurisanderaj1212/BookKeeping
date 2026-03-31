'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import {
  LayoutDashboard,
  Receipt,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Globe,
} from 'lucide-react'
import { useNotificationContext } from '@/lib/notificationContext'
import { getSupabase } from '@/lib/supabaseClient'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const menuItems: MenuItem[] = [
  { id: 'dashboard',    label: 'nav.home',         icon: LayoutDashboard, href: '/dashboard' },
  { id: 'transactions', label: 'nav.transactions', icon: Receipt,         href: '/transactions' },
  { id: 'reports',      label: 'nav.reports',      icon: FileText,        href: '/reports' },
  { id: 'analytics',    label: 'nav.analytics',    icon: BarChart3,       href: '/analytics' },
  { id: 'accounts',     label: 'nav.accounts',     icon: Wallet,          href: '/accounts' },
  { id: 'employees',    label: 'nav.employees',    icon: Users,           href: '/employees' },
]

const settingsItems: MenuItem[] = [
  { id: 'notifications', label: 'nav.notifications', icon: Bell,     href: '/notifications' },
  { id: 'settings',      label: 'nav.settings',      icon: Settings, href: '/settings' },
]

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const t        = useTranslations()
  const locale   = useLocale()

  const { isCollapsed, toggle: toggleCollapsed } = useSidebarCollapsed()
  const { unreadCount } = useNotificationContext()

  // Load real user data
  const [userName, setUserName]   = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      const first = meta.first_name ?? meta.firstName ?? ''
      const last  = meta.last_name  ?? meta.lastName  ?? ''
      const full  = [first, last].filter(Boolean).join(' ')
      setUserName(full || user.email?.split('@')[0] || '')
      setUserEmail(user.email ?? '')
    })
  }, [])

  const toggleSidebar = () => {
    toggleCollapsed()
  }

  const switchLocale = () => {
    const next = locale === 'es' ? 'en' : 'es'
    router.replace(pathname as any, { locale: next })
  }

  return (
    <>
      {/* Mobile overlay — closes sidebar when tapping outside on small screens */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 z-50 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        data-tour="sidebar"
      >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Chill Numbers</h1>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 ${isCollapsed ? 'mx-auto mt-2' : ''}`}
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed
            ? <ChevronRight className="w-4 h-4 text-gray-500" />
            : <ChevronLeft  className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      {/* ── Language switcher ── */}
      <div className={`px-3 py-2 border-b border-gray-100 shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <button
            onClick={switchLocale}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'
              ;(e.currentTarget as HTMLElement).style.background = '#eef2ff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'
              ;(e.currentTarget as HTMLElement).style.background = '#f9fafb'
            }}
          >
            <Globe style={{ width: '14px', height: '14px', color: '#6366f1', flexShrink: 0 }} />
            {/* Pill toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#e5e7eb',
              borderRadius: '20px',
              padding: '2px',
              gap: '2px',
              flex: 1,
            }}>
              {(['es', 'en'] as const).map(lang => (
                <span
                  key={lang}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    padding: '3px 0',
                    borderRadius: '16px',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    background: locale === lang ? '#6366f1' : 'transparent',
                    color: locale === lang ? '#ffffff' : '#6b7280',
                    boxShadow: locale === lang ? '0 1px 4px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </button>
        ) : (
          <button
            onClick={switchLocale}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1.5px solid #6366f1',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 800,
              color: '#6366f1',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#6366f1'
              ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#eef2ff'
              ;(e.currentTarget as HTMLElement).style.color = '#6366f1'
            }}
          >
            {locale === 'es' ? 'EN' : 'ES'}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col">
        <div className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname.includes(item.href)
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
                    title={isCollapsed ? t(item.label) : undefined}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{t(item.label)}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── System section ── */}
        <div className="border-t border-gray-200 pt-3 shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t('common.system')}
            </p>
          )}
          <ul className="space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname.includes(item.href)
              const Icon = item.icon
              const badge = item.id === 'notifications' ? unreadCount : 0
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={isCollapsed ? t(item.label) : undefined}
                    data-tour={item.id === 'settings' ? 'settings-link' : undefined}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium text-sm">{t(item.label)}</span>
                        {badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                            {badge > 99 ? '99+' : badge}
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

      {/* ── User section ── */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-2 p-2.5 rounded-lg bg-gray-50">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userName || userEmail.split('@')[0] || '—'}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-600 shrink-0" />
              <span className="font-medium text-sm">{t('nav.logout')}</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
