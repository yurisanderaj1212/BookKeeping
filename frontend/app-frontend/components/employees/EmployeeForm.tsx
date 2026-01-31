'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Employee, getPositions } from '@/data/employees-data'

interface EmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (employee: Omit<Employee, 'id'>) => void
  editingEmployee?: Employee | null
}

export default function EmployeeForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingEmployee 
}: EmployeeFormProps) {
  
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    salary: 0,
    payrollType: 'annual',
    hourlyRate: 0,
    hireDate: '',
    status: 'active',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when editing employee changes
  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        position: editingEmployee.position,
        salary: editingEmployee.salary,
        payrollType: editingEmployee.payrollType,
        hourlyRate: editingEmployee.hourlyRate || 0,
        hireDate: editingEmployee.hireDate || '',
        status: editingEmployee.status,
        notes: editingEmployee.notes || ''
      })
    } else {
      // Reset form for new employee
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        salary: 0,
        payrollType: 'annual',
        hourlyRate: 0,
        hireDate: '',
        status: 'active',
        notes: ''
      })
    }
    setErrors({})
  }, [editingEmployee, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido'
    if (!formData.position.trim()) newErrors.position = 'La posición es requerida'

    // Validate salary based on payroll type
    if (formData.payrollType === 'hourly') {
      if (!formData.hourlyRate || formData.hourlyRate <= 0) {
        newErrors.hourlyRate = 'La tarifa por hora debe ser mayor a 0'
      }
    } else {
      if (!formData.salary || formData.salary <= 0) {
        newErrors.salary = 'El salario debe ser mayor a 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPayrollLabel = (type: string) => {
    const labels = {
      hourly: 'Por Horas',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      annual: 'Anual',
      contract: 'Contratista',
      provider: 'Proveedor'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getSalaryLabel = () => {
    if (formData.payrollType === 'hourly') {
      return 'Tarifa por Hora *'
    }
    const labels = {
      weekly: 'Salario Semanal *',
      biweekly: 'Salario Quincenal *',
      monthly: 'Salario Mensual *',
      quarterly: 'Salario Trimestral *',
      annual: 'Salario Anual *',
      contract: 'Valor del Contrato *',
      provider: 'Tarifa de Proveedor *'
    }
    return labels[formData.payrollType as keyof typeof labels] || 'Salario *'
  }

  if (!isOpen) return null

  const positions = getPositions()

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Completa la información básica del empleado
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Apellido"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Empleo</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Desarrollador Senior"
                    list="positions"
                  />
                  <datalist id="positions">
                    {positions.map(pos => (
                      <option key={pos} value={pos} />
                    ))}
                  </datalist>
                  {errors.position && (
                    <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Nómina *
                  </label>
                  <select
                    value={formData.payrollType}
                    onChange={(e) => handleInputChange('payrollType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="hourly">Por Horas</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="annual">Anual</option>
                    <option value="contract">Contratista</option>
                    <option value="provider">Proveedor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getSalaryLabel()}
                  </label>
                  {formData.payrollType === 'hourly' ? (
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="25.00"
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.salary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5000"
                    />
                  )}
                  {(errors.hourlyRate || errors.salary) && (
                    <p className="text-red-500 text-xs mt-1">{errors.hourlyRate || errors.salary}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Contratación (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío si es un empleado existente que no se había registrado
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Información adicional sobre el empleado..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}