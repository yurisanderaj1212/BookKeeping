'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Download, Users, DollarSign, Building, UserCheck } from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import EmployeeList from '../../components/employees/EmployeeList'
import EmployeeForm from '../../components/employees/EmployeeForm'
import OnboardingTour from '../../components/onboarding/OnboardingTour'
import { useOnboarding } from '../../hooks/useOnboarding'
import { mockEmployees, Employee, getEmployeeStats, formatSalary } from '@/data/employees-data'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Onboarding hook
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding()

  const handleLogout = async () => {
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  const stats = getEmployeeStats()

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString()
    }
    setEmployees(prev => [...prev, newEmployee])
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }

  const handleUpdateEmployee = (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === editingEmployee.id 
            ? { ...employeeData, id: editingEmployee.id }
            : emp
        )
      )
      setEditingEmployee(null)
    }
  }

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingEmployee(null)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting employees data...')
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Empleados
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Administra la información de tu equipo de trabajo
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExport}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                  data-tour="add-employee-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Empleado</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-tour="employees-main">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Empleados Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Posiciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.positions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Nómina Total Anual</p>
                  <p className="text-2xl font-bold text-gray-900">{formatSalary(stats.totalPayroll)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar empleados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Mostrando {filteredEmployees.length} de {employees.length} empleados
            </p>
          </div>

          {/* Employee List */}
          <div data-tour="employee-list">
            <EmployeeList
              employees={filteredEmployees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          </div>

          {/* Employee Form Modal */}
          <EmployeeForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            editingEmployee={editingEmployee}
          />
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}