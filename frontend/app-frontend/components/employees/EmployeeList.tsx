'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, Mail, Phone, Calendar, DollarSign } from 'lucide-react'
import { Employee, PayrollTypeLabels, EmployeeStatus, PayrollType } from '@/services/employeeService'

const formatSalary = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

interface EmployeeListProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employeeId: number) => void
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null)

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDetailModalOpen(true)
  }

  const handleDeleteClick = (employee: Employee) => {
    setDeleteConfirmEmployee(employee)
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmEmployee) {
      onDelete(deleteConfirmEmployee.id)
      setDeleteConfirmEmployee(null)
    }
  }

  const getStatusBadge = (status: EmployeeStatus) => {
    const isActive = status === EmployeeStatus.Active
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  const getPayrollDisplay = (employee: Employee) => {
    if (employee.payrollType === PayrollType.Hourly) {
      return `${formatSalary(employee.hourlyRate || 0)}/hora`
    } else if (employee.payrollType === PayrollType.Annual || employee.payrollType === PayrollType.Contract || employee.payrollType === PayrollType.Provider) {
      return formatSalary(employee.salary)
    } else if (employee.payrollType === PayrollType.Weekly) {
      return `${formatSalary(employee.salary)}/semana`
    } else if (employee.payrollType === PayrollType.Biweekly) {
      return `${formatSalary(employee.salary)}/quincena`
    } else if (employee.payrollType === PayrollType.Monthly) {
      return `${formatSalary(employee.salary)}/mes`
    } else if (employee.payrollType === PayrollType.Quarterly) {
      return `${formatSalary(employee.salary)}/trimestre`
    }
    return 'No especificado'
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron empleados</h3>
        <p className="text-gray-500">No hay empleados que coincidan con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario
                </th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-1/8 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {PayrollTypeLabels[employee.payrollType] ?? 'Otro'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getPayrollDisplay(employee)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(employee.status)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(employee)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                        title="Editar empleado"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {isDetailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl border border-gray-200 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">
                    {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Contratación</p>
                    <p className="text-sm text-gray-900">
                      {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString('es-ES') : 'No especificada'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compensación</p>
                    <p className="text-sm text-gray-900">{getPayrollDisplay(selectedEmployee)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedEmployee.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notas</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedEmployee.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  onEdit(selectedEmployee)
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Editar Empleado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200 relative">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar a{' '}
                <span className="font-medium text-gray-900">
                  {deleteConfirmEmployee.firstName} {deleteConfirmEmployee.lastName}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setDeleteConfirmEmployee(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Eliminar Empleado
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}