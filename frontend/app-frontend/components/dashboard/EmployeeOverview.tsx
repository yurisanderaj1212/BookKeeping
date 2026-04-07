'use client'

import { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { getSupabase } from '@/lib/supabaseClient'

interface EmployeeOverviewProps {
  period: 'week' | 'month' | 'year'
}

interface Stats {
  activeCount: number
  totalAnnualPayroll: number
  uniquePositions: number
  uniquePayrollTypes: number
}

export default function EmployeeOverview({ period }: EmployeeOverviewProps) {
  const t = useTranslations('dashboard.employeeOverview')
  const locale = useLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('employees')
          .select('salary, payroll_type, position, status')

        if (cancelled) return
        const active = (data ?? []).filter(e => e.status === 1)
        const totalAnnualPayroll = active.reduce((s, e) => s + (e.salary ?? 0), 0)
        const uniquePositions = new Set(active.map(e => e.position)).size
        const uniquePayrollTypes = new Set(active.map(e => e.payroll_type)).size

        setStats({ activeCount: active.length, totalAnnualPayroll, uniquePositions, uniquePayrollTypes })
      } catch {
        setStats({ activeCount: 0, totalAnnualPayroll: 0, uniquePositions: 0, uniquePayrollTypes: 0 })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    }).format(amount)

  // Scale annual payroll to the selected period
  const periodPayroll = stats
    ? period === 'week'  ? stats.totalAnnualPayroll / 52
    : period === 'month' ? stats.totalAnnualPayroll / 12
    : stats.totalAnnualPayroll
    : 0

  const avgPerEmployee = stats && stats.activeCount > 0
    ? periodPayroll / stats.activeCount
    : 0

  const periodLabel = period === 'week'
    ? t('weekly') : period === 'month' ? t('monthly') : t('annual')

  const cards = [
    { bg: 'bg-blue-50',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   textColor: 'text-blue-600',   Icon: Users,      value: stats?.activeCount ?? 0,  label: t('activeEmployees'), isCurrency: false },
    { bg: 'bg-green-50',  iconBg: 'bg-green-100',  iconColor: 'text-green-600',  textColor: 'text-green-600',  Icon: DollarSign, value: periodPayroll,            label: `${t('payroll')} ${periodLabel}`, isCurrency: true },
    { bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', textColor: 'text-yellow-600', Icon: TrendingUp, value: avgPerEmployee,           label: t('avgPerEmployee'), isCurrency: true },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
        <Users className="w-5 h-5 text-primary-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const Icon = card.Icon
          return (
            <div key={i} className={`text-center p-4 ${card.bg} rounded-lg`}>
              <div className={`flex items-center justify-center w-10 h-10 ${card.iconBg} rounded-full mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.isCurrency ? formatCurrency(card.value as number) : card.value}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('uniquePositions')}</span>
            {loading
              ? <span className="ml-2 inline-block w-6 h-4 bg-gray-200 rounded animate-pulse" />
              : <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{stats?.uniquePositions ?? 0}</span>
            }
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('payrollTypes')}</span>
            {loading
              ? <span className="ml-2 inline-block w-6 h-4 bg-gray-200 rounded animate-pulse" />
              : <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{stats?.uniquePayrollTypes ?? 0}</span>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
