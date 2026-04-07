'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, Mail, Phone, Calendar, DollarSign } from 'lucide-react'
import { Employee, EmployeeStatus, PayrollType } from '@/services/employeeService'
import { useTranslations, useLocale } from 'next-intl'

interface EmployeeListProps {
  employees: Employee[]
  onEdit:    (employee: Employee) => void
  onDelete:  (employeeId: number) => void
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
  const t      = useTranslations('employees')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [selectedEmployee, setSelectedEmployee]       = useState<Employee | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen]     = useState(false)
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null)

  const formatSalary = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' }).format(amount)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES')

  const getPayrollDisplay = (emp: Employee) => {
    if (emp.payrollType === PayrollType.Hourly)     return `${formatSalary(emp.hourlyRate || 0)}${t('payPeriod.hourly')}`
    if (emp.payrollType === PayrollType.Weekly)     return `${formatSalary(emp.salary)}${t('payPeriod.weekly')}`
    if (emp.payrollType === PayrollType.Biweekly)   return `${formatSalary(emp.salary)}${t('payPeriod.biweekly')}`
    if (emp.payrollType === PayrollType.Monthly)    return `${formatSalary(emp.salary)}${t('payPeriod.monthly')}`
    if (emp.payrollType === PayrollType.Quarterly)  return `${formatSalary(emp.salary)}${t('payPeriod.quarterly')}`
    return formatSalary(emp.salary)
  }

  const getPayrollTypeLabel = (type: PayrollType) => t(`payrollTypes.${type}` as any)
  const getStatusLabel      = (status: EmployeeStatus) => status === EmployeeStatus.Active ? t('statusActive') : t('statusInactive')

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('notFound')}</h3>
        <p className="text-gray-500">{t('notFoundDesc')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colEmployee')}</th>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colPosition')}</th>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colSalary')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colStatus')}</th>
                <th className="w-1/8 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-sm text-gray-500 flex items-center"><Mail className="w-3 h-3 mr-1" />{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{emp.position}</div>
                    <div className="text-sm text-gray-500">{getPayrollTypeLabel(emp.payrollType)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{getPayrollDisplay(emp)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === EmployeeStatus.Active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {getStatusLabel(emp.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => { setSelectedEmployee(emp); setIsDetailModalOpen(true) }} className="text-gray-400 hover:text-gray-600" title={t('viewDetails')}><Eye className="w-4 h-4" /></button>
                      <button onClick={() => onEdit(emp)} className="text-primary-600 hover:text-primary-900" title={t('editEmployee')}><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirmEmployee(emp)} className="text-red-600 hover:text-red-900" title={t('deleteEmployee')}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">{selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                  <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-500">Email</p><p className="text-sm text-gray-900">{selectedEmployee.email}</p></div></div>
              <div className="flex items-center space-x-3"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-500">{t('detailPhone')}</p><p className="text-sm text-gray-900">{selectedEmployee.phone || '—'}</p></div></div>
              <div className="flex items-center space-x-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-500">{t('detailHireDate')}</p><p className="text-sm text-gray-900">{selectedEmployee.hireDate ? formatDate(selectedEmployee.hireDate) : t('detailHireDateEmpty')}</p></div></div>
              <div className="flex items-center space-x-3"><DollarSign className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-500">{t('detailCompensation')}</p><p className="text-sm text-gray-900">{getPayrollDisplay(selectedEmployee)}</p></div></div>
              {selectedEmployee.notes && (
                <div><h3 className="text-sm font-medium text-gray-700 mb-2">{t('detailNotes')}</h3><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEmployee.notes}</p></div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('close')}</button>
              <button onClick={() => { setIsDetailModalOpen(false); onEdit(selectedEmployee) }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{t('editEmployee')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900">{t('deleteConfirmTitle')}</h2></div>
            <div className="p-6">
              <p className="text-gray-600">{t('deleteConfirmMsg', { name: `${deleteConfirmEmployee.firstName} ${deleteConfirmEmployee.lastName}` })}</p>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setDeleteConfirmEmployee(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{tCommon('cancel')}</button>
              <button onClick={() => { onDelete(deleteConfirmEmployee.id); setDeleteConfirmEmployee(null) }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{t('deleteEmployee')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
