'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Users, DollarSign, UserCheck } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import EmployeeList from '@/components/employees/EmployeeList'
import EmployeeForm from '@/components/employees/EmployeeForm'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import Toast, { ToastContainer } from '@/components/ui/Toast'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/useToast'
import employeeService, { Employee, EmployeeStatus, PaginationMetadata } from '@/services/employeeService'

export default function EmployeesPage() {
  const { isLoading, isAuthenticated, logout } = useAuth()
  const { toasts, dismiss, success, error: toastError } = useToast()
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [totalPayroll, setTotalPayroll] = useState(0)
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20
  const { isOnboardingOpen, currentStep: onboardingStep, setStep: setOnboardingStep, closeOnboarding, completeOnboarding } = useOnboarding()

  const loadEmployees = useCallback(async (page = currentPage) => {
    try {
      setLoading(true)
      setError(null)

      const statusMap = { all: undefined, active: 1, inactive: 2 }
      const result = await employeeService.getPagedEmployees({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        status: statusMap[statusFilter],
        search: searchTerm.trim() || undefined,
        sortBy: 'lastName',
        sortDirection: 'asc'
      })

      setEmployees(result.data)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err.message || 'Error al cargar los empleados')
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, searchTerm])

  const loadTotalPayroll = useCallback(async () => {
    try {
      const total = await employeeService.getTotalPayroll()
      setTotalPayroll(total)
    } catch {
      // silencioso — no crítico
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees()
      loadTotalPayroll()
    }
  }, [isAuthenticated, loadEmployees, loadTotalPayroll])

  // Resetear a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  const handleSidebarToggle = useCallback((isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }, [])

  const handleAddEmployee = useCallback(async (employeeData: any) => {
    try {
      await employeeService.createEmployee(employeeData)
      setIsFormOpen(false)
      await loadEmployees(1)
      setCurrentPage(1)
      await loadTotalPayroll()
      success('Empleado creado exitosamente')
    } catch (err: any) {
      toastError(err.message || 'Error al crear el empleado')
    }
  }, [loadEmployees, loadTotalPayroll, success, toastError])

  const handleEditEmployee = useCallback((employee: Employee) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }, [])

  const handleUpdateEmployee = useCallback(async (employeeData: any) => {
    if (!editingEmployee) return
    try {
      await employeeService.updateEmployee(editingEmployee.id, employeeData)
      setEditingEmployee(null)
      setIsFormOpen(false)
      await loadEmployees()
      await loadTotalPayroll()
      success('Empleado actualizado exitosamente')
    } catch (err: any) {
      toastError(err.message || 'Error al actualizar el empleado')
    }
  }, [editingEmployee, loadEmployees, loadTotalPayroll, success, toastError])

  const handleDeleteEmployee = useCallback(async (employeeId: number) => {
    try {
      await employeeService.deleteEmployee(employeeId)
      await loadEmployees()
      employeeService.getTotalPayroll()
        .then(total => setTotalPayroll(total))
        .catch(() => {})
      success('Empleado desactivado exitosamente')
    } catch (err: any) {
      toastError(err.message || 'Error al desactivar el empleado')
    }
  }, [loadEmployees, success, toastError])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingEmployee(null)
  }, [])

  if (!isAuthenticated && !isLoading) return null

  // El filtrado lo hace el backend — employees ya viene filtrado y paginado
  const activeEmployees = employees.filter(emp => emp.status === EmployeeStatus.Active)

  const formatSalary = (amount: number): string =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                  data-tour="add-employee-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('new')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-tour="employees-main">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0"><Users className="w-6 h-6 text-blue-600" /></div>
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{t('totalEmployees')}</p>
                  <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0"><UserCheck className="w-6 h-6 text-green-600" /></div>
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{t('activeEmployees')}</p>
                  <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0"><DollarSign className="w-6 h-6 text-yellow-600" /></div>
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{t('annualPayroll')}</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{formatSalary(totalPayroll)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{t('filterLabel')}</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="active">{tCommon('active')}</option>
                  <option value="inactive">{tCommon('inactive')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {loading ? tCommon('loading') : pagination
                ? `${tCommon('showing')} ${employees.length} ${tCommon('of')} ${pagination.totalRecords} ${t('employeesLabel')} (${tCommon('page')} ${pagination.currentPage} ${tCommon('of')} ${pagination.totalPages})`
                : `${employees.length} ${t('employeesLabel')}`
              }
            </p>
          </div>

          <div data-tour="employee-list">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="px-6 py-4 border-b border-gray-100 flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <EmployeeList
                employees={employees}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
              />
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white rounded-lg border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-600">
                {tCommon('page')} {pagination.currentPage} {tCommon('of')} {pagination.totalPages} — {pagination.totalRecords} {t('employeesLabel')} {tCommon('total')}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setCurrentPage(p => p - 1); loadEmployees(currentPage - 1) }}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {tCommon('previous')}
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page); loadEmployees(page) }}
                      disabled={loading}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => { setCurrentPage(p => p + 1); loadEmployees(currentPage + 1) }}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {tCommon('next')}
                </button>
              </div>
            </div>
          )}

          <EmployeeForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            editingEmployee={editingEmployee}
          />
        </div>
      </div>

      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        currentStep={onboardingStep}
        setStep={setOnboardingStep}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
