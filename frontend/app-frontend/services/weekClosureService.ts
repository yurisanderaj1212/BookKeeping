import { apiClient } from '@/lib/apiClient'

export interface WeekClosureData {
  id: number
  year: number
  month: number
  weekNumber: number
  startDate: string
  endDate: string
  status: 'open' | 'pending' | 'closed'
  closedAt?: string
  closedBy?: string
  notes?: string
  income: number
  expenses: number
  netProfit: number
  transactionCount: number
  pendingTransactions: number
}

export interface WeekClosureSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  totalWeeks: number
  closedWeeks: number
  pendingWeeks: number
  openWeeks: number
}

export interface WeekClosureResponse {
  year: number
  month: number
  weeks: WeekClosureData[]
  summary: WeekClosureSummary
}

export async function getWeekClosures(year: number, month: number): Promise<WeekClosureResponse> {
  return apiClient(`/weekclosure?year=${year}&month=${month}`)
}

export async function closeWeek(id: number, closedBy?: string, notes?: string): Promise<any> {
  return apiClient(`/weekclosure/${id}/close`, {
    method: 'PUT',
    body: JSON.stringify({ closedBy, notes })
  })
}

export async function reopenWeek(id: number, notes?: string): Promise<any> {
  return apiClient(`/weekclosure/${id}/reopen`, {
    method: 'PUT',
    body: JSON.stringify({ notes })
  })
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount)
