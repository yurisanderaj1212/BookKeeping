'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { 
  mockEmployees, 
  getActiveEmployees, 
  getTotalPayroll, 
  formatSalary,
  getEmployeesByPayrollType 
} from '@/data/employees-data'

interface EmployeeSummaryReportProps {
  period: 'week' | 'month' | 'year'
}

export default function EmployeeSummaryReport({ period }: EmployeeSummaryReportProps) {
  const [barChartDimensions, setBarChartDimensions] = useState({ width: 0, height: 320 })
  const [pieChartDimensions, setPieChartDimensions] = useState({ width: 0, height: 320 })

  useEffect(() => {
    const updateDimensions = () => {
      const barContainer = document.getElementById('employee-bar-chart-container')
      const pieContainer = document.getElementById('employee-pie-chart-container')
      
      if (barContainer) {
        setBarChartDimensions({
          width: barContainer.offsetWidth,
          height: 320
        })
      }
      
      if (pieContainer) {
        setPieChartDimensions({
          width: pieContainer.offsetWidth,
          height: 320
        })
      }
    }

    // Actualizar dimensiones inmediatamente y después de un pequeño delay
    updateDimensions()
    const timer = setTimeout(updateDimensions, 100)

    // Actualizar en resize
    window.addEventListener('resize', updateDimensions)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  const activeEmployees = getActiveEmployees()
  const totalPayroll = getTotalPayroll()
  const avgSalary = activeEmployees.length > 0 ? totalPayroll / activeEmployees.length : 0

  // Calculate payroll by type
  const payrollTypes = [
    'hourly', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'contract', 'provider'
  ] as const

  const payrollData = payrollTypes.map(type => {
    const employees = getEmployeesByPayrollType(type)
    const activeEmps = employees.filter(emp => emp.status === 'active')
    
    let totalCost = 0
    activeEmps.forEach(emp => {
      if (type === 'hourly') {
        totalCost += (emp.hourlyRate || 0) * 40 * 52 // Assuming 40 hours/week, 52 weeks/year
      } else if (type === 'weekly') {
        totalCost += emp.salary * 52
      } else if (type === 'biweekly') {
        totalCost += emp.salary * 26
      } else if (type === 'monthly') {
        totalCost += emp.salary * 12
      } else if (type === 'quarterly') {
        totalCost += emp.salary * 4
      } else {
        totalCost += emp.salary
      }
    })

    return {
      type: type === 'hourly' ? 'Por Horas' :
            type === 'weekly' ? 'Semanal' :
            type === 'biweekly' ? 'Quincenal' :
            type === 'monthly' ? 'Mensual' :
            type === 'quarterly' ? 'Trimestral' :
            type === 'annual' ? 'Anual' :
            type === 'contract' ? 'Contratista' : 'Proveedor',
      employees: activeEmps.length,
      cost: totalCost
    }
  }).filter(item => item.employees > 0)

  // Position analysis
  const positionData = activeEmployees.reduce((acc, emp) => {
    const existing = acc.find(item => item.position === emp.position)
    if (existing) {
      existing.count += 1
      if (emp.payrollType === 'hourly') {
        existing.totalCost += (emp.hourlyRate || 0) * 40 * 52
      } else if (emp.payrollType === 'weekly') {
        existing.totalCost += emp.salary * 52
      } else if (emp.payrollType === 'biweekly') {
        existing.totalCost += emp.salary * 26
      } else if (emp.payrollType === 'monthly') {
        existing.totalCost += emp.salary * 12
      } else if (emp.payrollType === 'quarterly') {
        existing.totalCost += emp.salary * 4
      } else {
        existing.totalCost += emp.salary
      }
    } else {
      let cost = 0
      if (emp.payrollType === 'hourly') {
        cost = (emp.hourlyRate || 0) * 40 * 52
      } else if (emp.payrollType === 'weekly') {
        cost = emp.salary * 52
      } else if (emp.payrollType === 'biweekly') {
        cost = emp.salary * 26
      } else if (emp.payrollType === 'monthly') {
        cost = emp.salary * 12
      } else if (emp.payrollType === 'quarterly') {
        cost = emp.salary * 4
      } else {
        cost = emp.salary
      }
      
      acc.push({
        position: emp.position,
        count: 1,
        totalCost: cost
      })
    }
    return acc
  }, [] as { position: string; count: number; totalCost: number }[])

  const colors = ['#20B2AA', '#17A2B8', '#28A745', '#FFC107', '#DC3545', '#6F42C1', '#FD7E14', '#E83E8C']

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'Esta Semana'
      case 'month':
        return 'Este Mes'
      case 'year':
        return 'Este Año'
      default:
        return 'Período Actual'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Empleados Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeEmployees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nómina Total Anual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatSalary(totalPayroll)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Salario Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatSalary(avgSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Posiciones Únicas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{positionData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll by Type Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Distribución por Tipo de Nómina
          </h3>
          <div id="employee-bar-chart-container" className="w-full" style={{ height: 320 }}>
            {barChartDimensions.width > 0 ? (
              <ResponsiveContainer width={barChartDimensions.width} height={barChartDimensions.height}>
                <BarChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | undefined, name: string | undefined) => [
                      (name === 'employees') ? (value || 0) : formatSalary(value || 0),
                      (name === 'employees') ? 'Empleados' : 'Costo Anual'
                    ]}
                  />
                  <Bar dataKey="employees" fill="#20B2AA" name="employees" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>
        </div>

        {/* Cost by Position Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Costo por Posición
          </h3>
          <div id="employee-pie-chart-container" className="w-full" style={{ height: 320 }}>
            {pieChartDimensions.width > 0 ? (
              <ResponsiveContainer width={pieChartDimensions.width} height={pieChartDimensions.height}>
                <PieChart>
                  <Pie
                    data={positionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalCost"
                  >
                    {positionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => formatSalary(value || 0)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-400">Cargando gráfico...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Type Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Desglose por Tipo de Nómina
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Costo Anual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {payrollData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatSalary(item.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Position Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Desglose por Posición
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Costo Anual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {positionData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatSalary(item.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Lista de Empleados Activos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo de Nómina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Compensación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Costo Anual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {activeEmployees.map((employee) => {
                let annualCost = 0
                let compensation = ''
                
                if (employee.payrollType === 'hourly') {
                  annualCost = (employee.hourlyRate || 0) * 40 * 52
                  compensation = `${formatSalary(employee.hourlyRate || 0)}/hora`
                } else if (employee.payrollType === 'weekly') {
                  annualCost = employee.salary * 52
                  compensation = `${formatSalary(employee.salary)}/semana`
                } else if (employee.payrollType === 'biweekly') {
                  annualCost = employee.salary * 26
                  compensation = `${formatSalary(employee.salary)}/quincena`
                } else if (employee.payrollType === 'monthly') {
                  annualCost = employee.salary * 12
                  compensation = `${formatSalary(employee.salary)}/mes`
                } else if (employee.payrollType === 'quarterly') {
                  annualCost = employee.salary * 4
                  compensation = `${formatSalary(employee.salary)}/trimestre`
                } else {
                  annualCost = employee.salary
                  compensation = formatSalary(employee.salary)
                }

                return (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {employee.payrollType === 'hourly' ? 'Por Horas' :
                       employee.payrollType === 'weekly' ? 'Semanal' :
                       employee.payrollType === 'biweekly' ? 'Quincenal' :
                       employee.payrollType === 'monthly' ? 'Mensual' :
                       employee.payrollType === 'quarterly' ? 'Trimestral' :
                       employee.payrollType === 'annual' ? 'Anual' :
                       employee.payrollType === 'contract' ? 'Contratista' : 'Proveedor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {compensation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatSalary(annualCost)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}