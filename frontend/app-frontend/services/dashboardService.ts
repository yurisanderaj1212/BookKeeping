import { apiClient, buildQuery } from '@/lib/apiClient'

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pendingCount: number
  incomeChange: number
  expensesChange: number
  profitChange: number
  pendingChange: number
  periodLabel: string
  periodStart?: string
  periodEnd?: string
  periodType?: string
}

export interface ChartDataPoint {
  label: string
  income: number
  expenses: number
  startDate: string
  endDate: string
}

export interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  type: number
  amount: number
  percentage: number
  transactionCount: number
}

export interface DashboardQueryParams {
  period?: 'week' | 'month' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  [key: string]: string | number | boolean | null | undefined
}

export async function getSummary(params: DashboardQueryParams = {}): Promise<DashboardSummary> {
  return apiClient(`/dashboard/summary${buildQuery(params)}`)
}

export async function getWeeklyChartData(): Promise<ChartDataPoint[]> {
  return apiClient('/dashboard/weekly-chart')
}

export async function getMonthlyChartData(): Promise<ChartDataPoint[]> {
  return apiClient('/dashboard/monthly-chart')
}

export async function getCategoryBreakdown(
  params: DashboardQueryParams = {},
  limit = 10,
  transactionType?: number
): Promise<CategoryBreakdown[]> {
  return apiClient(`/dashboard/category-breakdown${buildQuery({ ...params, limit, transactionType })}`)
}

export async function getRecentTransactions(limit = 10): Promise<any[]> {
  return apiClient(`/dashboard/recent-transactions${buildQuery({ limit })}`)
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount)

export const formatPercentage = (pct: number) =>
  `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
