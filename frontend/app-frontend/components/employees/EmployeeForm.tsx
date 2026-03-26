'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Employee, CreateEmployeeDto, PayrollType, EmployeeStatus, PayrollTypeLabels } from '@/services/employeeService'

interface EmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (employee: CreateEmployeeDto) => void
  editingEmployee?: Employee | null
}

const defaultForm = (): CreateEmployeeDto => ({
  firstName: '', lastName: '', email: '', phone: '', position: '',
  salary: 0, payrollType: PayrollType.Annual, hourlyRate: 0,
  hireDate: '', status: EmployeeStatus.Active, notes: '',
})

export default function EmployeeForm({ isOpen, onClose, onSubmit, editingEmployee }: EmployeeFormProps) {
  const [formData, setFormData] = useState<CreateEmployeeDto>(defaultForm())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        phone: editingEmployee.phone ?? '',
        position: editingEmployee.position,
        salary: editingEmployee.salary,
        payrollType: editingEmployee.payrollType,
        hourlyRate: editingEmployee.hourlyRate ?? 0,
        hireDate: editingEmployee.hireDate ?? '',
        status: editingEmployee.status,
        notes: editingEmployee.notes ?? '',
      })
    } else {
      setFormData(defaultForm())
    }
    setErrors({})
  }, [editingEmployee, isOpen])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.firstName.trim()) e.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) e.lastName = 'El apellido es requerido'
    if (!formData.email.trim()) e.email = 'El email es requerido'
    if (!formData.position.trim()) e.position = 'La posición es requerida'
    if (formData.payrollType === PayrollType.Hourly) {
      if (!formData.hourlyRate || formData.hourlyRate <= 0) e.hourlyRate = 'La tarifa por hora debe ser mayor a 0'
    } else {
      if (!formData.salary || formData.salary <= 0) e.salary = 'El salario debe ser mayor a 0'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) { onSubmit(formData); onClose() }
  }

  const set = (field: keyof CreateEmployeeDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const getSalaryLabel = () => {
    if (formData.payrollType === PayrollType.Hourly) return 'Tarifa por Hora *'
    const map: Partial<Record<PayrollType, string>> = {
      [PayrollType.Weekly]: 'Salario Semanal *',
      [PayrollType.Biweekly]: 'Salario Quincenal *',
      [PayrollType.Monthly]: 'Salario Mensual *',
      [PayrollType.Quarterly]: 'Salario Trimestral *',
      [PayrollType.Annual]: 'Salario Anual *',
      [PayrollType.Contract]: 'Valor del Contrato *',
      [PayrollType.Provider]: 'Tarifa de Proveedor *',
    }
    return map[formData.payrollType] ?? 'Salario *'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Completa la información básica del empleado</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'firstName' as const, label: 'Nombre', type: 'text' },
                { field: 'lastName' as const, label: 'Apellido', type: 'text' },
                { field: 'email' as const, label: 'Email', type: 'email' },
                { field: 'phone' as const, label: 'Teléfono', type: 'tel' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
                  <input
                    type={type}
                    value={formData[field] as string}
                    onChange={e => set(field, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Empleo</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posición *</label>
              <input
                type="text"
                value={formData.position}
                onChange={e => set('position', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Nómina *</label>
                <select
                  value={formData.payrollType}
                  onChange={e => set('payrollType', Number(e.target.value) as PayrollType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(PayrollTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                <select
                  value={formData.status}
                  onChange={e => set('status', Number(e.target.value) as EmployeeStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={EmployeeStatus.Active}>Activo</option>
                  <option value={EmployeeStatus.Inactive}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getSalaryLabel()}</label>
                {formData.payrollType === PayrollType.Hourly ? (
                  <input
                    type="number" min="0" step="0.25"
                    value={formData.hourlyRate}
                    onChange={e => set('hourlyRate', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <input
                    type="number" min="0" step="100"
                    value={formData.salary}
                    onChange={e => set('salary', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.salary ? 'border-red-500' : 'border-gray-300'}`}
                  />
                )}
                {(errors.hourlyRate || errors.salary) && (
                  <p className="text-red-500 text-xs mt-1">{errors.hourlyRate || errors.salary}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={e => set('hireDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
            <textarea
              value={formData.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
