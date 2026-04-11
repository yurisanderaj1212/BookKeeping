import { getSupabase } from '@/lib/supabaseClient'

export interface ReportParams {
  period?: 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  year?: number
  month?: number
  type?: 1 | 2  // 1=Income, 2=Expense (matches Supabase schema)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getPeriodDates(params: ReportParams): { start: string; end: string } {
  if (params.startDate && params.endDate) {
    return { start: params.startDate, end: params.endDate }
  }

  const now = new Date()
  const year = params.year ?? now.getFullYear()
  const month = params.month ?? now.getMonth() + 1

  if (params.period === 'week') {
    // Fall back to current week if no explicit dates (should not happen normally)
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
  }

  if (params.period === 'month' || params.month) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
  }

  // year (default)
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

export const formatCurrency = (amount: number, locale?: string) => {
  try {
    const currency = typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('bookkeeping_preferences') || '{}').currency ?? 'USD')
      : 'USD'
    const numberLocale = locale ?? (currency === 'EUR' ? 'de-DE' : currency === 'MXN' ? 'es-MX' : currency === 'COP' ? 'es-CO' : 'en-US')
    return new Intl.NumberFormat(numberLocale, { style: 'currency', currency }).format(amount)
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }
}

// ─── Financial Summary ────────────────────────────────────────────────────────

export async function getFinancialSummary(params: ReportParams = {}): Promise<any> {
  const supabase = getSupabase()
  const { start, end } = getPeriodDates(params)

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name)')
    .gte('date', start)
    .lte('date', end)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  if (error) throw new Error(error.message)
  const rows = data ?? []

  const totalIncome = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
  const totalExpenses = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
  const netProfit = totalIncome - totalExpenses

  // Group by category
  const incomeMap = new Map<string, { amount: number; count: number }>()
  const expenseMap = new Map<string, { amount: number; count: number }>()

  for (const r of rows) {
    const name = (r.categories as any)?.name ?? 'Sin categoría'
    const map = r.type === 1 ? incomeMap : expenseMap
    const existing = map.get(name) ?? { amount: 0, count: 0 }
    existing.amount += r.amount
    existing.count++
    map.set(name, existing)
  }

  const toBreakdown = (map: Map<string, { amount: number; count: number }>, total: number) =>
    Array.from(map.entries())
      .map(([categoryName, v]) => ({
        categoryName,
        amount: v.amount,
        transactionCount: v.count,
        percentage: total > 0 ? parseFloat(((v.amount / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin: totalIncome > 0 ? parseFloat(((netProfit / totalIncome) * 100).toFixed(1)) : 0,
    transactionCount: rows.length,
    incomeCount: rows.filter(r => r.type === 1).length,
    expenseCount: rows.filter(r => r.type === 2).length,
    incomeBreakdown: toBreakdown(incomeMap, totalIncome),
    expenseBreakdown: toBreakdown(expenseMap, totalExpenses),
    periodStart: start,
    periodEnd: end,
  }
}

// ─── Profit & Loss (monthly breakdown) ───────────────────────────────────────

export async function getProfitLoss(params: ReportParams = {}): Promise<any> {
  const supabase = getSupabase()
  const year = params.year ?? new Date().getFullYear()
  const startDate = params.month ? `${year}-${String(params.month).padStart(2, '0')}-01` : `${year}-01-01`
  const endDate = params.month
    ? new Date(year, params.month, 0).toISOString().split('T')[0]
    : `${year}-12-31`

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .gte('date', startDate)
    .lte('date', endDate)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  if (error) throw new Error(error.message)
  const rows = data ?? []

  // Group by month
  const monthMap = new Map<number, { income: number; expenses: number }>()
  for (const r of rows) {
    const m = new Date(r.date).getMonth() + 1
    const existing = monthMap.get(m) ?? { income: 0, expenses: 0 }
    if (r.type === 1) existing.income += r.amount
    else existing.expenses += r.amount
    monthMap.set(m, existing)
  }

  const months = params.month
    ? [params.month]
    : Array.from({ length: 12 }, (_, i) => i + 1)

  const monthsData = months.map(m => {
    const d = monthMap.get(m) ?? { income: 0, expenses: 0 }
    const netProfit = d.income - d.expenses
    return {
      month: m,
      monthName: new Date(year, m - 1, 1).toLocaleDateString('es', { month: 'long' }),
      income: d.income,
      expenses: d.expenses,
      netProfit,
      margin: d.income > 0 ? parseFloat(((netProfit / d.income) * 100).toFixed(1)) : 0,
    }
  })

  const totalIncome = monthsData.reduce((s, m) => s + m.income, 0)
  const totalExpenses = monthsData.reduce((s, m) => s + m.expenses, 0)
  const totalNetProfit = totalIncome - totalExpenses

  return {
    year,
    months: monthsData,
    totalIncome,
    totalExpenses,
    totalNetProfit,
    profitMargin: totalIncome > 0 ? parseFloat(((totalNetProfit / totalIncome) * 100).toFixed(1)) : 0,
  }
}

// ─── Transaction Summary ──────────────────────────────────────────────────────

export async function getTransactionSummary(params: ReportParams = {}): Promise<any> {
  const supabase = getSupabase()
  const { start, end } = getPeriodDates(params)

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, status, category_id, categories(name), date, description')
    .gte('date', start)
    .lte('date', end)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = data ?? []

  const totalIncome = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
  const totalExpenses = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
  const pendingCount = rows.filter(r => r.status === 1).length
  const completedCount = rows.filter(r => r.status === 0).length

  return {
    totalTransactions: rows.length,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    pendingCount,
    completedCount,
    incomeCount: rows.filter(r => r.type === 1).length,
    expenseCount: rows.filter(r => r.type === 2).length,
    transactions: rows.map(r => ({
      ...r,
      categoryName: (r.categories as any)?.name ?? 'Sin categoría',
    })),
    periodStart: start,
    periodEnd: end,
  }
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

export async function getCategoryBreakdown(params: ReportParams = {}): Promise<any> {
  const supabase = getSupabase()
  const { start, end } = getPeriodDates(params)

  let query = supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name)')
    .gte('date', start)
    .lte('date', end)

  if (params.type) query = query.eq('type', params.type)
  query = query.or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const rows = data ?? []

  const totalIncome = rows.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
  const totalExpenses = rows.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)

  const map = new Map<number, { name: string; type: number; amount: number; count: number }>()
  for (const r of rows) {
    const id = r.category_id
    const name = (r.categories as any)?.name ?? 'Sin categoría'
    const existing = map.get(id) ?? { name, type: r.type, amount: 0, count: 0 }
    existing.amount += r.amount
    existing.count++
    map.set(id, existing)
  }

  const breakdown = Array.from(map.entries()).map(([id, v]) => {
    const total = v.type === 1 ? totalIncome : totalExpenses
    return {
      categoryId: id,
      categoryName: v.name,
      type: v.type,
      amount: v.amount,
      percentage: total > 0 ? parseFloat(((v.amount / total) * 100).toFixed(1)) : 0,
      transactionCount: v.count,
    }
  }).sort((a, b) => b.amount - a.amount)

  return {
    breakdown,
    totalIncome,
    totalExpenses,
    periodStart: start,
    periodEnd: end,
  }
}

