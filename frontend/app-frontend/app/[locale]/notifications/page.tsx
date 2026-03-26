'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations, useLocale } from 'next-intl'
import {
  Bell, Filter, Search, Check, CheckCheck, Trash2,
  Receipt, FileText, Users, Settings, Clock, AlertTriangle,
  ChevronDown, Calendar, Eye, EyeOff
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import {
  getNotifications, getStats, markAsRead, markAllAsRead,
  deleteNotification, deleteAllRead, formatTimestamp, getNotificationColor,
  translateNotification,
  type Notification, type NotificationStats
} from '@/services/notificationService'

function getIcon(type: Notification['type']) {
  switch (type) {
    case 'transaction': return Receipt
    case 'report': return FileText
    case 'employee': return Users
    case 'system': return Settings
    case 'reminder': return Clock
    case 'alert': return AlertTriangle
    default: return Bell
  }
}



function getPriorityBadge(priority: Notification['priority']): string {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'medium': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('notificationsPage')
  const tCommon = useTranslations('common')
  const tEvents = useTranslations('notificationEvents')
  const locale = useLocale()

  const getTypeLabel = (type: Notification['type']): string =>
    t(`typeLabelSingle.${type}` as Parameters<typeof t>[0])

  const getPriorityLabel = (priority: Notification['priority']): string =>
    t(`priorityLabelSingle.${priority}` as Parameters<typeof t>[0])

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [notifs, st] = await Promise.all([getNotifications(), getStats()])
      setNotifications(notifs)
      setStats(st)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
      // No mostrar error al usuario — el backend puede estar reiniciando
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadData()
  }, [isAuthenticated, loadData])

  if (!isAuthenticated && !isLoading) return null

  const filteredNotifications = notifications.filter(n => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesRaw = n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term)
      const { title, message } = translateNotification(n, tEvents as (key: string, params?: Record<string, string>) => string)
      const matchesTranslated = title.toLowerCase().includes(term) || message.toLowerCase().includes(term)
      if (!matchesRaw && !matchesTranslated) return false
    }
    if (filter === 'unread' && n.isRead) return false
    if (filter === 'read' && !n.isRead) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
    return true
  })

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    if (stats) setStats({ ...stats, unread: Math.max(0, stats.unread - 1), read: stats.read + 1 })
  }

  const handleDelete = async (id: number) => {
    const removed = notifications.find(n => n.id === id)
    await deleteNotification(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (stats && removed) {
      setStats({
        ...stats,
        total: stats.total - 1,
        unread: removed.isRead ? stats.unread : Math.max(0, stats.unread - 1),
        read: stats.read - (removed.isRead ? 1 : 0)
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    if (stats) setStats({ ...stats, unread: 0, read: stats.total })
  }

  const handleDeleteAllRead = async () => {
    await deleteAllRead()
    const remaining = notifications.filter(n => !n.isRead)
    setNotifications(remaining)
    setSelectedIds([])
    if (stats) setStats({ ...stats, total: remaining.length, read: 0 })
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) await handleMarkAsRead(n.id)
    if (n.actionUrl) router.push(n.actionUrl)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id))
    }
  }

  const handleBulkMarkAsRead = async () => {
    await Promise.all(selectedIds.map(id => markAsRead(id)))
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n))
    setSelectedIds([])
    loadData()
  }

  const handleBulkDelete = async () => {
    await Promise.all(selectedIds.map(id => deleteNotification(id)))
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)))
    setSelectedIds([])
    loadData()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Bell className="w-6 h-6 text-primary-600" />
                  <span>{t('title')}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
              </div>
              <div className="flex items-center space-x-2">
                {stats && stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <CheckCheck className="w-4 h-4" />
                  <span>{t('markAllRead')}</span>
                  </button>
                )}
                {stats && stats.read > 0 && (
                  <button
                    onClick={handleDeleteAllRead}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  <span>{t('clearRead')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: t('total'),  value: stats?.total ?? 0,                  icon: Bell,          color: 'text-gray-400' },
              { label: t('unread'), value: stats?.unread ?? 0,                 icon: Eye,           color: 'text-red-400',    valueColor: 'text-red-600' },
              { label: t('read'),   value: stats?.read ?? 0,                   icon: EyeOff,        color: 'text-green-400',  valueColor: 'text-green-600' },
              { label: t('urgent'), value: stats?.byPriority?.urgent ?? 0,     icon: AlertTriangle, color: 'text-orange-400', valueColor: 'text-orange-600' },
            ].map(({ label, value, icon: Icon, color, valueColor }) => (
              <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-2xl font-bold ${valueColor ?? 'text-gray-900'}`}>{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>{t('filters')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('statusLabel')}</label>
                  <select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
                    <option value="all">{t('allStatus')} ({stats?.total ?? 0})</option>
                    <option value="unread">{t('unreadStatus')} ({stats?.unread ?? 0})</option>
                    <option value="read">{t('readStatus')} ({stats?.read ?? 0})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('typeLabel')}</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
                    <option value="all">{t('allTypes')}</option>
                    <option value="transaction">{t('typeTransaction')} ({stats?.byType?.transaction ?? 0})</option>
                    <option value="report">{t('typeReport')} ({stats?.byType?.report ?? 0})</option>
                    <option value="employee">{t('typeEmployee')} ({stats?.byType?.employee ?? 0})</option>
                    <option value="alert">{t('typeAlert')} ({stats?.byType?.alert ?? 0})</option>
                    <option value="reminder">{t('typeReminder')} ({stats?.byType?.reminder ?? 0})</option>
                    <option value="system">{t('typeSystem')} ({stats?.byType?.system ?? 0})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('priorityLabel')}</label>
                  <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
                    <option value="all">{t('allPriorities')}</option>
                    <option value="urgent">{t('priorityUrgent')} ({stats?.byPriority?.urgent ?? 0})</option>
                    <option value="high">{t('priorityHigh')} ({stats?.byPriority?.high ?? 0})</option>
                    <option value="medium">{t('priorityMedium')} ({stats?.byPriority?.medium ?? 0})</option>
                    <option value="low">{t('priorityLow')} ({stats?.byPriority?.low ?? 0})</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-primary-700">
                {selectedIds.length} {selectedIds.length > 1 ? t('notificationPlural') : t('notification')} {selectedIds.length > 1 ? t('selectedPlural') : t('selected')}
              </span>
              <div className="flex items-center space-x-3">
                <button onClick={handleBulkMarkAsRead} className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                  <Check className="w-4 h-4" /><span>{t('markRead')}</span>
                </button>
                <button onClick={handleBulkDelete} className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1">
                  <Trash2 className="w-4 h-4" /><span>{t('clearRead')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty')}</h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm ? t('emptyFiltered') :
                   filter === 'unread' ? t('emptyFiltered') :
                   t('emptyDesc')}
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{t('selectAll')}</span>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map(n => {
                    const Icon = getIcon(n.type)
                    const colorClasses = getNotificationColor(n.priority)
                    const isSelected = selectedIds.includes(n.id)
                    const { title, message } = translateNotification(n, tEvents as (key: string, params?: Record<string, string>) => string)

                    return (
                      <div
                        key={n.id}
                        className={`p-6 transition-colors ${!n.isRead ? 'bg-blue-50 border-l-4 border-l-primary-500' : 'hover:bg-gray-50'} ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedIds(prev =>
                              prev.includes(n.id) ? prev.filter(x => x !== n.id) : [...prev, n.id]
                            )}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className={`p-3 rounded-full ${colorClasses} flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(n)}>
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                  <h3 className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {title}
                                  </h3>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(n.priority)}`}>
                                    {getPriorityLabel(n.priority)}
                                  </span>
                                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    {getTypeLabel(n.type)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatTimestamp(n.createdAt, locale)}</span>
                                  </span>
                                  {n.actionLabel && (
                                    <span className="text-xs text-primary-600 font-medium">{n.actionLabel} →</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                {!n.isRead && (
                                  <button onClick={() => handleMarkAsRead(n.id)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors" title={t('markRead')}>
                                    <Check className="w-4 h-4 text-gray-500" />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(n.id)}
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors" title={tCommon('delete')}>
                                  <Trash2 className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
