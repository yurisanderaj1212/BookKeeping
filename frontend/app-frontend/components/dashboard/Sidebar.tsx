'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import {
  LayoutDashboard,
  Receipt,
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
import { getAvatarUrl } from '@/services/userService'

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

  // Load real user data — cached in sessionStorage to avoid flicker on navigation
  const [userName, setUserName]   = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // Try cache first to avoid avatar flicker on page navigation
    const CACHE_KEY = 'sidebar_user_cache'
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { name, email, avatar } = JSON.parse(cached)
        setUserName(name ?? '')
        setUserEmail(email ?? '')
        setAvatarUrl(avatar ?? null)
      }
    } catch { /* ignore */ }

    getSupabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      const first = meta.first_name ?? meta.firstName ?? ''
      const last  = meta.last_name  ?? meta.lastName  ?? ''
      const full  = [first, last].filter(Boolean).join(' ')
      const name  = full || user.email?.split('@')[0] || ''
      const email = user.email ?? ''
      const avatar = meta.avatar_path ? getAvatarUrl(meta.avatar_path) : null
      setUserName(name)
      setUserEmail(email)
      setAvatarUrl(avatar)
      // Cache so next navigation shows instantly
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ name, email, avatar }))
      } catch { /* ignore */ }
    })

    // Listen for profile updates from settings page to update avatar instantly
    const onProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.name !== undefined)   setUserName(detail.name)
      if (detail?.avatar !== undefined) setAvatarUrl(detail.avatar)
      try {
        const prev = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? '{}')
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...prev, ...detail }))
      } catch { /* ignore */ }
    }
    window.addEventListener('profile-updated', onProfileUpdate)
    return () => window.removeEventListener('profile-updated', onProfileUpdate)
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
      {/* ── Mobile overlay ── */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──
          Mobile:  fixed drawer, hidden off-screen when collapsed, slides in when open
          Desktop: fixed sidebar, w-16 when collapsed, w-64 when expanded
      */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-50
          transition-transform duration-300 ease-in-out
          lg:transition-all lg:duration-300
          ${isCollapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-16'
            : 'translate-x-0 w-64'
          }`}
        data-tour="sidebar"
      >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chill Numbers</h1>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0 ${isCollapsed ? 'mx-auto mt-2' : ''}`}
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed
            ? <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            : <ChevronLeft  className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
        </button>
      </div>

      {/* ── Language switcher ── */}
      {/* moved to bottom — see user section */}

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
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    title={isCollapsed ? t(item.label) : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                    {!isCollapsed && (
                      <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{t(item.label)}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── System section ── */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
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
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    title={isCollapsed ? t(item.label) : undefined}
                    data-tour={item.id === 'settings' ? 'settings-link' : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                    )}
                    <div className="relative">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
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
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-primary-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {userName || userEmail.split('@')[0] || '—'}
                </p>
                <p className="text-xs truncate">
                  {userName
                    ? <span className="text-gray-500 dark:text-gray-400">{userEmail}</span>
                    : <span className="text-primary-500 font-medium">Completa tu perfil →</span>
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 group mb-2"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-600 dark:group-hover:text-red-400 shrink-0" />
              <span className="font-medium text-sm">{t('nav.logout')}</span>
            </button>
            {/* Language switcher */}
            <button
              onClick={switchLocale}
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 gap-0.5 flex-1">
                {(['es', 'en'] as const).map(lang => (
                  <span key={lang} className="flex-1 text-center" style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                    padding: '3px 0', borderRadius: '16px', transition: 'all 0.25s',
                    background: locale === lang ? '#6366f1' : 'transparent',
                    color: locale === lang ? '#fff' : '#6b7280',
                  }}>
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              {avatarUrl
                ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                : <User className="w-4 h-4 text-primary-600" />
              }
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
            {/* Language switcher collapsed */}
            <button
              onClick={switchLocale}
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className="w-9 h-9 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all duration-200"
              style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1', letterSpacing: '0.5px' }}
            >
              {locale === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
