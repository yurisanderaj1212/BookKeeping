'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { 
  mockEmployees, 
  getActiveEmployees, 
  getTotalPayroll, 
  formatSalary,
  getEmployeesByPayrollType 
} from '@/data/employees-data'

interface EmployeeAnalysisProps {
  period: 'week' | 'month' | 'year'
}

export default function EmployeeAnalysis({ period }: EmployeeAnalysisProps) {
  const activeEmployees = getActiveEmployees()
  const totalPayroll = getTotalPayroll()

  // Calculate payroll distribution
  const payrollTypes = [
    'hourly', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'contract', 'provider'
  ] as const

  const payrollDistribution = payrollTypes.map(type => {
    const employees = getEmployeesByPayrollType(type).filter(emp => emp.status === 'active')
    return {
      type: type === 'hourly' ? 'Por Horas' :
            type === 'weekly' ? 'Semanal' :
            type === 'biweekly' ? 'Quincenal' :
            type === 'monthly' ? 'Mensual' :
            type === 'quarterly' ? 'Trimestral' :
            type === 'annual' ? 'Anual' :
            type === 'contract' ? 'Contratista' : 'Proveedor',
      count: employees.length,
      percentage: activeEmployees.length > 0 ? (employees.length / activeEmployees.length) * 100 : 0
    }
  }).filter(item => item.count > 0)

  // Calculate cost by position
  const positionCosts = activeEmployees.reduce((acc, emp) => {
    const existing = acc.find(item => item.position === emp.position)
    let annualCost = 0
    
    if (emp.payrollType === 'hourly') {
      annualCost = (emp.hourlyRate || 0) * 40 * 52
    } else if (emp.payrollType === 'weekly') {
      annualCost = emp.salary * 52
    } else if (emp.payrollType === 'biweekly') {
      annualCost = emp.salary * 26
    } else if (emp.payrollType === 'monthly') {
      annualCost = emp.salary * 12
    } else if (emp.payrollType === 'quarterly') {
      annualCost = emp.salary * 4
    } else {
      annualCost = emp.salary
    }

    if (existing) {
      existing.cost += annualCost
      existing.count += 1
    } else {
      acc.push({
        position: emp.position,
        cost: annualCost,
        count: 1
      })
    }
    return acc
  }, [] as { position: string; cost: number; count: number }[])

  const colors = ['#20B2AA', '#17A2B8', '#28A745', '#FFC107', '#DC3545', '#6F42C1']

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

  return (
    <div className="space-y-6">
      {/* Employee Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Empleados Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {mockEmployees.length - activeEmployees.length} inactivos
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Costo de Nómina</p>
              <p className="text-2xl font-bold text-gray-900">{formatSalary(periodPayroll)}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                Costo {getPeriodLabel()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Costo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatSalary(activeEmployees.length > 0 ? periodPayroll / activeEmployees.length : 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Por empleado
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Type Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Tipo de Nómina
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }: any) => `${name} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {payrollDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost by Position */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Costo por Posición
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionCosts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatSalary(value * periodMultiplier)} />
                <YAxis dataKey="position" type="category" width={100} fontSize={12} />
                <Tooltip 
                  formatter={(value: number | undefined) => [formatSalary((value || 0) * periodMultiplier), `Costo ${getPeriodLabel()}`]}
                />
                <Bar dataKey="cost" fill="#20B2AA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen de Empleados por Posición
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Anual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positionCosts.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatSalary(item.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatSalary(item.cost / item.count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((item.cost / totalPayroll) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}