'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Bell, 
  Filter, 
  Search, 
  Check, 
  CheckCheck, 
  Trash2, 
  Archive,
  Receipt,
  FileText,
  Users,
  Settings,
  Clock,
  AlertTriangle,
  ChevronDown,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  mockNotifications,
  getUnreadNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  formatTimestamp,
  getNotificationColor,
  type Notification
} from '@/data/notifications-data'

export default function NotificationsPage() {
  const router = useRouter()
  
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }
  
  // Si no está autenticado, el hook ya redirigió al login
  if (!isAuthenticated) {
    return null
  }

  const stats = getNotificationStats()

  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Read/Unread filter
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    
    // Type filter
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    
    // Priority filter
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false
    
    return true
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleLogout = async () => {
    logout() // Usar la función logout del hook useAuth
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
      setNotifications([...mockNotifications])
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
    setNotifications([...mockNotifications])
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId)
    setNotifications([...mockNotifications])
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    setNotifications([...mockNotifications])
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id))
    setNotifications([...mockNotifications])
    setSelectedNotifications([])
  }

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id))
    setNotifications([...mockNotifications])
    setSelectedNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'transaction':
        return Receipt
      case 'report':
        return FileText
      case 'employee':
        return Users
      case 'system':
        return Settings
      case 'reminder':
        return Clock
      case 'alert':
        return AlertTriangle
      default:
        return Bell
    }
  }

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'transaction':
        return 'Transacción'
      case 'report':
        return 'Reporte'
      case 'employee':
        return 'Empleado'
      case 'system':
        return 'Sistema'
      case 'reminder':
        return 'Recordatorio'
      case 'alert':
        return 'Alerta'
      default:
        return 'Notificación'
    }
  }

  const getPriorityLabel = (priority: Notification['priority']) => {
    switch (priority) {
      case 'low':
        return 'Baja'
      case 'medium':
        return 'Media'
      case 'high':
        return 'Alta'
      case 'urgent':
        return 'Urgente'
      default:
        return 'Media'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Bell className="w-6 h-6 text-primary-600" />
                  <span>Centro de Notificaciones</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona todas tus notificaciones y alertas del sistema
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Marcar todas como leídas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No Leídas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <Eye className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Leídas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.read}</p>
                </div>
                <EyeOff className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.byPriority.urgent}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Todas ({stats.total})</option>
                    <option value="unread">No leídas ({stats.unread})</option>
                    <option value="read">Leídas ({stats.read})</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="transaction">Transacciones ({stats.byType.transaction})</option>
                    <option value="report">Reportes ({stats.byType.report})</option>
                    <option value="employee">Empleados ({stats.byType.employee})</option>
                    <option value="alert">Alertas ({stats.byType.alert})</option>
                    <option value="reminder">Recordatorios ({stats.byType.reminder})</option>
                    <option value="system">Sistema ({stats.byType.system})</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="urgent">Urgente ({stats.byPriority.urgent})</option>
                    <option value="high">Alta ({stats.byPriority.high})</option>
                    <option value="medium">Media ({stats.byPriority.medium})</option>
                    <option value="low">Baja ({stats.byPriority.low})</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">
                  {selectedNotifications.length} notificación{selectedNotifications.length > 1 ? 'es' : ''} seleccionada{selectedNotifications.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Marcar como leídas</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="bg-white rounded-lg border border-gray-200">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'No se encontraron notificaciones que coincidan con tu búsqueda.' : 
                   filter === 'unread' ? 'Todas las notificaciones están leídas.' : 
                   'No tienes notificaciones en este momento.'}
                </p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Seleccionar todas
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => {
                    const Icon = getIcon(notification.type)
                    const colorClasses = getNotificationColor(notification.priority)
                    const isSelected = selectedNotifications.includes(notification.id)
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
                        } ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          
                          <div className={`p-3 rounded-full ${colorClasses} flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {getPriorityLabel(notification.priority)}
                                  </span>
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    {getTypeLabel(notification.type)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatTimestamp(notification.timestamp)}</span>
                                    </span>
                                  </div>
                                  {notification.actionLabel && (
                                    <span className="text-xs text-primary-600 font-medium">
                                      {notification.actionLabel} →
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    title="Marcar como leída"
                                  >
                                    <Check className="w-4 h-4 text-gray-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                  title="Eliminar notificación"
                                >
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