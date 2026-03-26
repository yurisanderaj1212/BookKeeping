import { apiClient, buildQuery } from '@/lib/apiClient'

export interface ReportParams {
  period?: 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  year?: number
  month?: number
  type?: 0 | 1
}

export async function getFinancialSummary(params: ReportParams = {}): Promise<any> {
  return apiClient<any>(`/reports/financial-summary${buildQuery({
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate
  })}`)
}

export async function getProfitLoss(params: ReportParams = {}): Promise<any> {
  return apiClient<any>(`/reports/profit-loss${buildQuery({
    year: params.year ?? new Date().getFullYear(),
    month: params.month
  })}`)
}

export async function getTransactionSummary(params: ReportParams = {}): Promise<any> {
  return apiClient<any>(`/reports/transaction-summary${buildQuery({
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate
  })}`)
}

export async function getCategoryBreakdown(params: ReportParams = {}): Promise<any> {
  return apiClient<any>(`/reports/category-breakdown${buildQuery({
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate,
    type: params.type
  })}`)
}

export async function getEmployeeSummary(): Promise<any> {
  return apiClient<any>('/reports/employee-summary')
}

export const formatCurrency = (amount: number, locale?: string) =>
  new Intl.NumberFormat(locale ?? 'en-US', { style: 'currency', currency: 'USD' }).format(amount)
