'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, DollarSign, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { employeeService, PayrollType, EmployeeStatus, type Employee } from '@/services/employeeService'

interface EmployeeAnalysisProps {
  period: 'week' | 'month' | 'year'
}

const COLORS = ['#20B2AA', '#17A2B8', '#28A745', '#FFC107', '#DC3545', '#6F42C1', '#FF6B6B', '#4ECDC4']

export default function EmployeeAnalysis({ period }: EmployeeAnalysisProps) {
  const t      = useTranslations('analytics.components')
  const tEmp   = useTranslations('employees')
  const locale = useLocale()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    employeeService.getAllEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false))
  }, [])

  const formatSalary = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

  const active   = employees.filter(e => e.status === EmployeeStatus.Active)
  const inactive = employees.filter(e => e.status === EmployeeStatus.Inactive)

  const getAnnualCost = (emp: Employee): number => {
    switch (emp.payrollType) {
      case PayrollType.Hourly:    return (emp.hourlyRate || 0) * 40 * 52
      case PayrollType.Weekly:    return emp.salary * 52
      case PayrollType.Biweekly:  return emp.salary * 26
      case PayrollType.Monthly:   return emp.salary * 12
      case PayrollType.Quarterly: return emp.salary * 4
      default:                    return emp.salary
    }
  }

  const totalAnnualPayroll = active.reduce((s, e) => s + getAnnualCost(e), 0)

  const periodMultiplier = period === 'week' ? 1/52 : period === 'month' ? 1/12 : 1
  const periodPayroll    = totalAnnualPayroll * periodMultiplier
  const avgPerEmployee   = active.length > 0 ? periodPayroll / active.length : 0

  const getPeriodLabel = () => {
    if (period === 'week')  return tEmp('payPeriod.weekly')
    if (period === 'month') return tEmp('payPeriod.monthly')
    return t('annual')
  }

  // Payroll type distribution
  const payrollDist = ([1,2,3,4,5,6,7,8] as PayrollType[]).map(type => {
    const count = active.filter(e => e.payrollType === type).length
    return {
      type:       tEmp(`payrollTypes.${type}` as any),
      count,
      percentage: active.length > 0 ? (count / active.length) * 100 : 0,
    }
  }).filter(d => d.count > 0)

  // Cost by position
  const positionCosts = active.reduce((acc, emp) => {
    const cost = getAnnualCost(emp)
    const existing = acc.find(x => x.position === emp.position)
    if (existing) { existing.cost += cost; existing.count++ }
    else acc.push({ position: emp.position, cost, count: 1 })
    return acc
  }, [] as { position: string; cost: number; count: number }[])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{t('activeEmployees')}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{active.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{inactive.length} {tEmp('statusInactive').toLowerCase()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{t('payrollCost')}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{formatSalary(periodPayroll)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{getPeriodLabel()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{t('avgCost')}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{formatSalary(avgPerEmployee)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('perEmployee')}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg"><TrendingUp className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll type pie */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('payrollDistribution')}</h3>
          {payrollDist.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('noData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={payrollDist} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                  label={({ type, percentage }: any) => `${type} (${percentage.toFixed(0)}%)`} labelLine={false}>
                  {payrollDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [v, t('employees')]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cost by position bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('costByPosition')}</h3>
          {positionCosts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('noData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={positionCosts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={v => formatSalary(v * periodMultiplier)} tick={{ fontSize: 11 }} />
                <YAxis dataKey="position" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [formatSalary(v * periodMultiplier), getPeriodLabel()]} />
                <Bar dataKey="cost" fill="#20B2AA" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900">{t('employeeSummaryByPosition')}</h3>
        </div>
        {positionCosts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{t('noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[t('position'), t('employees'), t('annualCost'), t('avgCost'), t('pctTotal')].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {positionCosts.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatSalary(item.cost)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatSalary(item.cost / item.count)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {totalAnnualPayroll > 0 ? ((item.cost / totalAnnualPayroll) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
