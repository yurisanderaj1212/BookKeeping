// Centralized notifications data - will be replaced with API calls later

export interface Notification {
  id: string
  type: 'transaction' | 'report' | 'employee' | 'system' | 'reminder' | 'alert'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    transactionId?: string
    reportType?: string
    employeeId?: string
    amount?: number
    category?: string
  }
}

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'transaction',
    priority: 'medium',
    title: 'Nueva Transacción Agregada',
    message: 'Se agregó una transacción de $2,500.00 en la categoría Servicios Profesionales',
    timestamp: '2024-01-26T10:30:00Z',
    read: false,
    actionUrl: '/transactions',
    actionLabel: 'Ver Transacción',
    metadata: {
      transactionId: '1',
      amount: 2500,
      category: 'income-services'
    }
  },
  {
    id: '2',
    type: 'report',
    priority: 'low',
    title: 'Reporte Mensual Disponible',
    message: 'Tu reporte financiero de enero 2024 está listo para revisar',
    timestamp: '2024-01-26T09:15:00Z',
    read: false,
    actionUrl: '/reports/financial-summary',
    actionLabel: 'Ver Reporte',
    metadata: {
      reportType: 'monthly'
    }
  },
  {
    id: '3',
    type: 'employee',
    priority: 'medium',
    title: 'Nuevo Empleado Agregado',
    message: 'Sarah Johnson ha sido agregada al sistema como Gerente de Ventas',
    timestamp: '2024-01-26T08:45:00Z',
    read: true,
    actionUrl: '/employees',
    actionLabel: 'Ver Empleados',
    metadata: {
      employeeId: '1'
    }
  },
  {
    id: '4',
    type: 'alert',
    priority: 'high',
    title: 'Gastos Elevados Detectados',
    message: 'Los gastos de este mes han superado el promedio en un 25%',
    timestamp: '2024-01-26T07:20:00Z',
    read: false,
    actionUrl: '/analytics',
    actionLabel: 'Ver Análisis'
  },
  {
    id: '5',
    type: 'reminder',
    priority: 'urgent',
    title: 'Recordatorio: Cierre Semanal',
    message: 'Es hora de realizar el cierre semanal de operaciones',
    timestamp: '2024-01-26T06:00:00Z',
    read: false,
    actionUrl: '/week-close',
    actionLabel: 'Realizar Cierre'
  },
  {
    id: '6',
    type: 'system',
    priority: 'low',
    title: 'Actualización del Sistema',
    message: 'Nueva versión disponible con mejoras de rendimiento',
    timestamp: '2024-01-25T18:30:00Z',
    read: true,
    actionUrl: '/settings',
    actionLabel: 'Ver Configuración'
  },
  {
    id: '7',
    type: 'transaction',
    priority: 'medium',
    title: 'Transacción Pendiente',
    message: 'Tienes 3 transacciones pendientes de aprobación',
    timestamp: '2024-01-25T16:45:00Z',
    read: false,
    actionUrl: '/transactions',
    actionLabel: 'Revisar Pendientes'
  },
  {
    id: '8',
    type: 'employee',
    priority: 'medium',
    title: 'Nómina Procesada',
    message: 'La nómina quincenal ha sido procesada exitosamente para 5 empleados',
    timestamp: '2024-01-25T14:20:00Z',
    read: true,
    actionUrl: '/employees',
    actionLabel: 'Ver Detalles'
  },
  {
    id: '9',
    type: 'alert',
    priority: 'high',
    title: 'Meta de Ingresos Alcanzada',
    message: '¡Felicidades! Has alcanzado el 105% de tu meta mensual de ingresos',
    timestamp: '2024-01-25T12:10:00Z',
    read: false,
    actionUrl: '/dashboard',
    actionLabel: 'Ver Dashboard'
  },
  {
    id: '10',
    type: 'reminder',
    priority: 'medium',
    title: 'Recordatorio: Backup de Datos',
    message: 'Recuerda realizar el backup semanal de tus datos financieros',
    timestamp: '2024-01-25T10:00:00Z',
    read: true,
    actionUrl: '/settings',
    actionLabel: 'Configurar Backup'
  }
]

// Helper functions
export const getNotificationById = (id: string): Notification | undefined => {
  return mockNotifications.find(notification => notification.id === id)
}

export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter(notification => !notification.read)
}

export const getNotificationsByType = (type: Notification['type']): Notification[] => {
  return mockNotifications.filter(notification => notification.type === type)
}

export const getNotificationsByPriority = (priority: Notification['priority']): Notification[] => {
  return mockNotifications.filter(notification => notification.priority === priority)
}

export const getRecentNotifications = (limit: number = 5): Notification[] => {
  return mockNotifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

export const markAsRead = (id: string): void => {
  const notification = mockNotifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

export const markAllAsRead = (): void => {
  mockNotifications.forEach(notification => {
    notification.read = true
  })
}

export const deleteNotification = (id: string): void => {
  const index = mockNotifications.findIndex(n => n.id === id)
  if (index > -1) {
    mockNotifications.splice(index, 1)
  }
}

export const getNotificationStats = () => {
  const total = mockNotifications.length
  const unread = getUnreadNotifications().length
  const byType = {
    transaction: getNotificationsByType('transaction').length,
    report: getNotificationsByType('report').length,
    employee: getNotificationsByType('employee').length,
    system: getNotificationsByType('system').length,
    reminder: getNotificationsByType('reminder').length,
    alert: getNotificationsByType('alert').length
  }
  const byPriority = {
    low: getNotificationsByPriority('low').length,
    medium: getNotificationsByPriority('medium').length,
    high: getNotificationsByPriority('high').length,
    urgent: getNotificationsByPriority('urgent').length
  }

  return {
    total,
    unread,
    read: total - unread,
    byType,
    byPriority
  }
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Ahora mismo'
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'transaction':
      return 'Receipt'
    case 'report':
      return 'FileText'
    case 'employee':
      return 'Users'
    case 'system':
      return 'Settings'
    case 'reminder':
      return 'Clock'
    case 'alert':
      return 'AlertTriangle'
    default:
      return 'Bell'
  }
}

export const getNotificationColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'low':
      return 'text-gray-600 bg-gray-100'
    case 'medium':
      return 'text-blue-600 bg-blue-100'
    case 'high':
      return 'text-orange-600 bg-orange-100'
    case 'urgent':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Function to create new notifications (for demo purposes)
export const createNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }
  
  mockNotifications.unshift(newNotification)
  return newNotification
}