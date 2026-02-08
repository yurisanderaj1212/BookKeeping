// Notification service for real-time notifications simulation

import { createNotification, type Notification } from '@/data/notifications-data'

export class NotificationService {
  private static instance: NotificationService
  private listeners: ((notification: Notification) => void)[] = []

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to new notifications
  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Emit a new notification
  private emit(notification: Notification) {
    this.listeners.forEach(listener => listener(notification))
  }

  // Create and emit a new notification
  createAndEmit(notificationData: Omit<Notification, 'id' | 'timestamp'>) {
    const notification = createNotification(notificationData)
    this.emit(notification)
    return notification
  }

  // Predefined notification creators
  notifyTransactionAdded(amount: number, category: string, transactionId: string) {
    return this.createAndEmit({
      type: 'transaction',
      priority: 'medium',
      title: 'Nueva Transacción Agregada',
      message: `Se agregó una transacción de $${amount.toLocaleString()} en ${category}`,
      read: false,
      actionUrl: '/transactions',
      actionLabel: 'Ver Transacción',
      metadata: {
        transactionId,
        amount,
        category
      }
    })
  }

  notifyEmployeeAdded(employeeName: string, position: string, employeeId: string) {
    return this.createAndEmit({
      type: 'employee',
      priority: 'medium',
      title: 'Nuevo Empleado Agregado',
      message: `${employeeName} ha sido agregado como ${position}`,
      read: false,
      actionUrl: '/employees',
      actionLabel: 'Ver Empleados',
      metadata: {
        employeeId
      }
    })
  }

  notifyReportGenerated(reportType: string, period: string) {
    return this.createAndEmit({
      type: 'report',
      priority: 'low',
      title: 'Reporte Generado',
      message: `Tu reporte ${reportType} de ${period} está listo`,
      read: false,
      actionUrl: '/reports',
      actionLabel: 'Ver Reporte',
      metadata: {
        reportType
      }
    })
  }

  notifyHighExpenses(percentage: number) {
    return this.createAndEmit({
      type: 'alert',
      priority: 'high',
      title: 'Gastos Elevados Detectados',
      message: `Los gastos han superado el promedio en un ${percentage}%`,
      read: false,
      actionUrl: '/analytics',
      actionLabel: 'Ver Análisis'
    })
  }

  notifyWeeklyCloseReminder() {
    return this.createAndEmit({
      type: 'reminder',
      priority: 'urgent',
      title: 'Recordatorio: Cierre Semanal',
      message: 'Es hora de realizar el cierre semanal de operaciones',
      read: false,
      actionUrl: '/week-close',
      actionLabel: 'Realizar Cierre'
    })
  }

  notifyPayrollProcessed(employeeCount: number) {
    return this.createAndEmit({
      type: 'employee',
      priority: 'medium',
      title: 'Nómina Procesada',
      message: `La nómina ha sido procesada exitosamente para ${employeeCount} empleados`,
      read: false,
      actionUrl: '/employees',
      actionLabel: 'Ver Detalles'
    })
  }

  notifyGoalAchieved(goalType: string, percentage: number) {
    return this.createAndEmit({
      type: 'alert',
      priority: 'high',
      title: `Meta de ${goalType} Alcanzada`,
      message: `¡Felicidades! Has alcanzado el ${percentage}% de tu meta`,
      read: false,
      actionUrl: '/dashboard',
      actionLabel: 'Ver Dashboard'
    })
  }

  notifySystemUpdate(version: string) {
    return this.createAndEmit({
      type: 'system',
      priority: 'low',
      title: 'Actualización del Sistema',
      message: `Nueva versión ${version} disponible con mejoras`,
      read: false,
      actionUrl: '/settings',
      actionLabel: 'Ver Configuración'
    })
  }

  notifyBackupReminder() {
    return this.createAndEmit({
      type: 'reminder',
      priority: 'medium',
      title: 'Recordatorio: Backup de Datos',
      message: 'Recuerda realizar el backup semanal de tus datos',
      read: false,
      actionUrl: '/settings',
      actionLabel: 'Configurar Backup'
    })
  }

  notifyPendingTransactions(count: number) {
    return this.createAndEmit({
      type: 'transaction',
      priority: 'medium',
      title: 'Transacciones Pendientes',
      message: `Tienes ${count} transacciones pendientes de aprobación`,
      read: false,
      actionUrl: '/transactions',
      actionLabel: 'Revisar Pendientes'
    })
  }

  // Simulate random notifications for demo purposes
  startDemoNotifications() {
    const notifications = [
      () => this.notifyTransactionAdded(1500, 'Servicios Profesionales', 'demo-1'),
      () => this.notifyEmployeeAdded('Ana García', 'Desarrolladora', 'demo-emp-1'),
      () => this.notifyReportGenerated('Financiero', 'Enero 2024'),
      () => this.notifyHighExpenses(15),
      () => this.notifyPayrollProcessed(6),
      () => this.notifyGoalAchieved('Ingresos', 110),
      () => this.notifyPendingTransactions(2)
    ]

    // Send a random notification every 30 seconds
    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      randomNotification()
    }, 30000)

    return () => clearInterval(interval)
  }
}

export const notificationService = NotificationService.getInstance()