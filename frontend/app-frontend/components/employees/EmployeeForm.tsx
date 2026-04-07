'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Employee, CreateEmployeeDto, PayrollType, EmployeeStatus } from '@/services/employeeService'
import { useTranslations } from 'next-intl'

interface EmployeeFormProps {
  isOpen:           boolean
  onClose:          () => void
  onSubmit:         (employee: CreateEmployeeDto) => void
  editingEmployee?: Employee | null
}

const defaultForm = (): CreateEmployeeDto => ({
  firstName: '', lastName: '', email: '', phone: '', position: '',
  salary: 0, payrollType: PayrollType.Annual, hourlyRate: 0,
  status: EmployeeStatus.Active, notes: '',
})

export default function EmployeeForm({ isOpen, onClose, onSubmit, editingEmployee }: EmployeeFormProps) {
  const t       = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState<CreateEmployeeDto>(defaultForm())
  const [errors, setErrors]     = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        firstName:   editingEmployee.firstName,
        lastName:    editingEmployee.lastName,
        email:       editingEmployee.email,
        phone:       editingEmployee.phone ?? '',
        position:    editingEmployee.position,
        salary:      editingEmployee.salary,
        payrollType: editingEmployee.payrollType,
        hourlyRate:  editingEmployee.hourlyRate ?? 0,
        status:      editingEmployee.status,
        notes:       editingEmployee.notes ?? '',
      })
    } else {
      setFormData(defaultForm())
    }
    setErrors({})
  }, [editingEmployee, isOpen])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.firstName.trim()) e.firstName = t('form.firstNameRequired')
    if (!formData.lastName.trim())  e.lastName  = t('form.lastNameRequired')
    if (!formData.email.trim())     e.email     = t('form.emailRequired')
    if (!formData.position.trim())  e.position  = t('form.positionRequired')
    if (formData.payrollType === PayrollType.Hourly) {
      if (!formData.hourlyRate || formData.hourlyRate <= 0) e.hourlyRate = t('form.hourlyRateRequired')
    } else {
      if (!formData.salary || formData.salary <= 0) e.salary = t('form.salaryRequired')
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

  const getSalaryLabel = () => t(`salaryLabel.${
    formData.payrollType === PayrollType.Hourly    ? 'hourly'    :
    formData.payrollType === PayrollType.Weekly    ? 'weekly'    :
    formData.payrollType === PayrollType.Biweekly  ? 'biweekly'  :
    formData.payrollType === PayrollType.Monthly   ? 'monthly'   :
    formData.payrollType === PayrollType.Quarterly ? 'quarterly' :
    formData.payrollType === PayrollType.Annual    ? 'annual'    :
    formData.payrollType === PayrollType.Contract  ? 'contract'  : 'provider'
  }` as any)

  if (!isOpen) return null

  const payrollTypes = [1,2,3,4,5,6,7,8] as PayrollType[]
  const isHourly = formData.payrollType === PayrollType.Hourly

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {editingEmployee ? t('form.editTitle') : t('form.title')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('form.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Personal — 2 columns */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('form.personalInfo')}</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { field: 'firstName' as const, label: t('form.firstName'), type: 'text',  required: true },
                { field: 'lastName'  as const, label: t('form.lastName'),  type: 'text',  required: true },
                { field: 'email'     as const, label: t('form.email'),     type: 'email', required: true },
                { field: 'phone'     as const, label: t('form.phone'),     type: 'tel',   required: false },
              ]).map(({ field, label, type, required }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input type={type} value={formData[field] as string}
                    onChange={e => set(field, e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors[field] && <p className="text-red-500 text-xs mt-0.5">{errors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Employment — compact */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('form.employmentInfo')}</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Position — full width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.position')}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input type="text" value={formData.position} onChange={e => set('position', e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.position ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.position && <p className="text-red-500 text-xs mt-0.5">{errors.position}</p>}
              </div>

              {/* Payroll type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.payrollType')}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select value={formData.payrollType} onChange={e => set('payrollType', Number(e.target.value) as PayrollType)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  {payrollTypes.map(v => <option key={v} value={v}>{t(`payrollTypes.${v}` as any)}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('form.status')}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select value={formData.status} onChange={e => set('status', Number(e.target.value) as EmployeeStatus)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value={EmployeeStatus.Active}>{t('statusActive')}</option>
                  <option value={EmployeeStatus.Inactive}>{t('statusInactive')}</option>
                </select>
              </div>

              {/* Salary — full width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {getSalaryLabel()}
                </label>
                <input
                  type="number" min="0" step={isHourly ? '0.25' : '100'}
                  value={isHourly ? (formData.hourlyRate || '') : (formData.salary || '')}
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                    set(isHourly ? 'hourlyRate' : 'salary', val)
                  }}
                  placeholder="0.00"
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${(errors.hourlyRate || errors.salary) ? 'border-red-500' : 'border-gray-300'}`}
                />
                {(errors.hourlyRate || errors.salary) && <p className="text-red-500 text-xs mt-0.5">{errors.hourlyRate || errors.salary}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('form.notes')}</label>
            <textarea value={formData.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{tCommon('cancel')}</button>
            <button type="submit" className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {editingEmployee ? t('form.saveChanges') : t('form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
