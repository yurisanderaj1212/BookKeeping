import { getSupabase } from '@/lib/supabaseClient'

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
}

// ─── Helpers de fechas ────────────────────────────────────────────────────────

function getPeriodDates(period: string = 'week'): { start: string; end: string; prevStart: string; prevEnd: string } {
  const now = new Date()
  let start: Date, end: Date, prevStart: Date, prevEnd: Date

  if (period === 'week') {
    const day = now.getDay()
    start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0,0,0,0)
    end = new Date(start); end.setDate(start.getDate() + 6)
    prevStart = new Date(start); prevStart.setDate(start.getDate() - 7)
    prevEnd = new Date(start); prevEnd.setDate(start.getDate() - 1)
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  } else {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31)
    prevStart = new Date(now.getFullYear() - 1, 0, 1)
    prevEnd = new Date(now.getFullYear() - 1, 11, 31)
  }

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { start: fmt(start), end: fmt(end), prevStart: fmt(prevStart), prevEnd: fmt(prevEnd) }
}

async function sumByType(startDate: string, endDate: string): Promise<{ income: number; expenses: number; pending: number }> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('transactions')
    .select('type, amount, status')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('status', 'eq', 1) // excluir pendientes de Plaid sin revisar
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  let income = 0, expenses = 0, pending = 0
  for (const r of data ?? []) {
    if (r.type === 1) income += r.amount
    else expenses += r.amount
    if (r.status === 1) pending++
  }
  return { income, expenses, pending }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function getSummary(params: DashboardQueryParams = {}): Promise<DashboardSummary> {
  const { start, end, prevStart, prevEnd } = getPeriodDates(params.period ?? 'week')
  const [curr, prev] = await Promise.all([sumByType(start, end), sumByType(prevStart, prevEnd)])

  const pct = (a: number, b: number) => {
    if (b === 0) return a === 0 ? 0 : (a > 0 ? 100 : -100)
    if (b < 0) return 0  // previous was negative — percentage is misleading, hide it
    return parseFloat(((a - b) / Math.abs(b) * 100).toFixed(1))
  }

  // Profit margin = (profit / revenue) * 100
  const profitMargin = (income: number, profit: number) =>
    income === 0 ? 0 : parseFloat(((profit / income) * 100).toFixed(1))

  return {
    totalIncome: curr.income,
    totalExpenses: curr.expenses,
    netProfit: curr.income - curr.expenses,
    pendingCount: curr.pending,
    incomeChange: pct(curr.income, prev.income),
    expensesChange: pct(curr.expenses, prev.expenses),
    profitChange: profitMargin(curr.income, curr.income - curr.expenses),
    pendingChange: pct(curr.pending, prev.pending),
    periodLabel: params.period ?? 'week',
    periodStart: start,
    periodEnd: end,
    periodType: params.period ?? 'week',
  }
}

export async function getWeeklyChartData(): Promise<ChartDataPoint[]> {
  const supabase = getSupabase()
  const now = new Date()

  // Find the Sunday that starts the current week
  const currentSunday = new Date(now)
  currentSunday.setDate(now.getDate() - now.getDay()) // go back to Sunday
  currentSunday.setHours(0, 0, 0, 0)

  // Build 5 weeks going back from current week
  const weeks: { start: Date; end: Date }[] = []
  for (let i = 4; i >= 0; i--) {
    const start = new Date(currentSunday)
    start.setDate(currentSunday.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    weeks.push({ start, end })
  }

  // Fetch all transactions covering the full range
  const rangeStart = weeks[0].start.toISOString().split('T')[0]
  const rangeEnd   = weeks[4].end.toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions').select('type, amount, date')
    .gte('date', rangeStart).lte('date', rangeEnd)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  const rows = data ?? []

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  return weeks.map(({ start, end }) => {
    const startStr = fmt(start)
    const endStr   = fmt(end)
    const weekRows = rows.filter(r => r.date >= startStr && r.date <= endStr)
    let income = 0, expenses = 0
    for (const r of weekRows) {
      if (r.type === 1) income += r.amount
      else expenses += r.amount
    }
    // Label: "Mar 29 - Apr 5" style if crosses months, else "29-5"
    const startDay = start.getDate()
    const endDay   = end.getDate()
    const startMon = start.getMonth()
    const endMon   = end.getMonth()
    const label = startMon !== endMon
      ? `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}-${endDay}`
      : `${startDay}-${endDay}`
    return { label, income, expenses, startDate: startStr, endDate: endStr }
  })
}

export async function getMonthlyChartData(): Promise<ChartDataPoint[]> {
  const supabase = getSupabase()
  const now = new Date()
  const results: ChartDataPoint[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString().split('T')[0]
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('transactions').select('type, amount').gte('date', start).lte('date', end)
      .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

    let income = 0, expenses = 0
    for (const r of data ?? []) {
      if (r.type === 1) income += r.amount
      else expenses += r.amount
    }
    results.push({ label: d.toLocaleDateString(undefined, { month: 'short' }), income, expenses, startDate: start, endDate: end })
  }
  return results
}

export async function getCategoryBreakdown(
  params: DashboardQueryParams = {},
  limit = 10,
  transactionType?: number
): Promise<CategoryBreakdown[]> {
  const supabase = getSupabase()
  const { start, end } = getPeriodDates(params.period ?? 'year')

  let query = supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name)')
    .gte('date', start).lte('date', end)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  if (transactionType) query = query.eq('type', transactionType)

  const { data } = await query
  if (!data?.length) return []

  const map = new Map<number, { name: string; type: number; amount: number; count: number }>()
  let total = 0

  for (const r of data) {
    const id = r.category_id
    const name = (r.categories as any)?.name ?? 'Sin categoría'
    const existing = map.get(id) ?? { name, type: r.type, amount: 0, count: 0 }
    existing.amount += r.amount
    existing.count++
    map.set(id, existing)
    total += r.amount
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({
      categoryId: id,
      categoryName: v.name,
      type: v.type,
      amount: v.amount,
      percentage: total > 0 ? parseFloat(((v.amount / total) * 100).toFixed(1)) : 0,
      transactionCount: v.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

export async function getRecentTransactions(limit = 10): Promise<any[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .order('date', { ascending: false })
    .limit(limit)

  return (data ?? []).map(r => ({
    ...r,
    categoryId: r.category_id,
    categoryName: (r.categories as any)?.name,
  }))
}

export const formatCurrency = (amount: number, locale?: string) =>
  new Intl.NumberFormat(locale ?? 'en-US', { style: 'currency', currency: 'USD' }).format(amount)

export const formatPercentage = (pct: number) =>
  `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
