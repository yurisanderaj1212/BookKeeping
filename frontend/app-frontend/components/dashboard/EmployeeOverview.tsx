'use client'

import { Users, DollarSign, TrendingUp } from 'lucide-react'
import { getActiveEmployees, getTotalPayroll, formatSalary } from '@/data/employees-data'

interface EmployeeOverviewProps {
  period: 'week' | 'month' | 'year'
}

export default function EmployeeOverview({ period }: EmployeeOverviewProps) {
  const activeEmployees = getActiveEmployees()
  const totalPayroll = getTotalPayroll()
  const avgSalary = activeEmployees.length > 0 ? totalPayroll / activeEmployees.length : 0

  const getPeriodMultiplier = () => {
    switch (period) {
      case 'week':
        return 1/52
      case 'month':
        return 1/12
      case 'year':
        return 1
      default:
        return 1
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'semanal'
      case 'month':
        return 'mensual'
      case 'year':
        return 'anual'
      default:
        return 'del período'
    }
  }

  const periodMultiplier = getPeriodMultiplier()
  const periodPayroll = totalPayroll * periodMultiplier
  const periodAvgSalary = avgSalary * periodMultiplier

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Personal</h3>
        <Users className="w-5 h-5 text-primary-600" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{activeEmployees.length}</p>
          <p className="text-sm text-gray-600">Empleados Activos</p>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatSalary(periodPayroll)}</p>
          <p className="text-sm text-gray-600 capitalize">Nómina {getPeriodLabel()}</p>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatSalary(periodAvgSalary)}</p>
          <p className="text-sm text-gray-600">Promedio por empleado</p>
        </div>
      </div>

      {/* Quick Employee Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Posiciones únicas:</span>
            <span className="ml-2 font-medium text-gray-900">
              {[...new Set(activeEmployees.map(emp => emp.position))].length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Tipos de nómina:</span>
            <span className="ml-2 font-medium text-gray-900">
              {[...new Set(activeEmployees.map(emp => emp.payrollType))].length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}