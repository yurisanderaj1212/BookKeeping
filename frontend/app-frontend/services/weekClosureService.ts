import { getSupabase } from '@/lib/supabaseClient'
import { getWeeksForMonth } from '@/lib/weekUtils'

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

function toISO(date: string) { return date + 'T00:00:00' }

// ─── Main functions ───────────────────────────────────────────────────────────

export async function getWeekClosures(year: number, month: number): Promise<WeekClosureResponse> {
  const supabase = getSupabase()

  // 1. Get all week definitions for this month
  const weekDefs = getWeeksForMonth(year, month)

  // 2. Get existing closures from DB for this month
  const { data: closures, error: closureErr } = await supabase
    .from('week_closures')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .order('week_number')

  if (closureErr) throw new Error(closureErr.message)

  // 3. Get all transactions for this month to compute per-week stats
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd   = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: txs, error: txErr } = await supabase
    .from('transactions')
    .select('type, amount, date, status')
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  if (txErr) throw new Error(txErr.message)
  const transactions = txs ?? []

  // 4. Build WeekClosureData for each week
  const closureMap = new Map((closures ?? []).map(c => [c.week_number, c]))
  const today = new Date().toISOString().split('T')[0]

  // Auto-close past weeks that are still open (end_date < today and no closure record)
  const weeksToAutoClose = weekDefs.filter(def => {
    return def.endDate < today && !closureMap.has(def.weekNumber)
  })

  if (weeksToAutoClose.length > 0) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      for (const def of weeksToAutoClose) {
        const weekTxs = transactions.filter(tx => tx.date >= def.startDate && tx.date <= def.endDate)
        const wIncome   = weekTxs.filter(tx => tx.type === 1).reduce((s, tx) => s + Number(tx.amount), 0)
        const wExpenses = weekTxs.filter(tx => tx.type === 2).reduce((s, tx) => s + Number(tx.amount), 0)

        const { data: inserted } = await supabase
          .from('week_closures')
          .insert({
            user_id:        user.id,
            week_number:    def.weekNumber,
            year,
            month,
            start_date:     def.startDate,
            end_date:       def.endDate,
            total_income:   wIncome,
            total_expenses: wExpenses,
            net_profit:     wIncome - wExpenses,
            notes:          'Cierre automático — semana finalizada sin cerrar manualmente.',
            closed_at:      new Date().toISOString(),
          })
          .select('id')
          .single()

        if (inserted) closureMap.set(def.weekNumber, { ...inserted, week_number: def.weekNumber, notes: 'Cierre automático' })
      }
    }
  }

  const weeks: WeekClosureData[] = weekDefs.map(def => {
    const closure = closureMap.get(def.weekNumber)

    // Transactions in this week
    const weekTxs = transactions.filter(tx => tx.date >= def.startDate && tx.date <= def.endDate)
    const income   = weekTxs.filter(tx => tx.type === 1).reduce((s, tx) => s + Number(tx.amount), 0)
    const expenses = weekTxs.filter(tx => tx.type === 2).reduce((s, tx) => s + Number(tx.amount), 0)
    const pending  = weekTxs.filter(tx => tx.status === 1).length

    const status: WeekClosureData['status'] = closure ? 'closed' : pending > 0 ? 'pending' : 'open'

    return {
      id:                  closure?.id ?? -(def.weekNumber), // negative id = not yet in DB
      year,
      month,
      weekNumber:          def.weekNumber,
      startDate:           def.startDate,
      endDate:             def.endDate,
      status,
      closedAt:            closure?.closed_at ?? undefined,
      closedBy:            closure?.closed_by ?? undefined,
      notes:               closure?.notes ?? undefined,
      income,
      expenses,
      netProfit:           income - expenses,
      transactionCount:    weekTxs.length,
      pendingTransactions: pending,
    }
  })

  // 5. Summary
  const totalIncome   = weeks.reduce((s, w) => s + w.income, 0)
  const totalExpenses = weeks.reduce((s, w) => s + w.expenses, 0)
  const closedWeeks   = weeks.filter(w => w.status === 'closed').length
  const pendingWeeks  = weeks.filter(w => w.status === 'pending').length

  return {
    year,
    month,
    weeks,
    summary: {
      totalIncome,
      totalExpenses,
      netProfit:    totalIncome - totalExpenses,
      totalWeeks:   weeks.length,
      closedWeeks,
      pendingWeeks,
      openWeeks:    weeks.length - closedWeeks - pendingWeeks,
    },
  }
}

export async function closeWeek(id: number, closedBy?: string, notes?: string): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // id < 0 means the week has no DB record yet — we need to find the week data from the page
  // The page passes the full WeekClosureData, so we use the week_number + year + month
  // But since we only have id here, we need to handle both cases:
  if (id < 0) {
    // Week not yet in DB — we can't close it without the week definition
    // The caller should pass the week data. For now, throw a helpful error.
    throw new Error('Week data not found. Please refresh and try again.')
  }

  const { error } = await supabase
    .from('week_closures')
    .update({
      closed_at: new Date().toISOString(),
      closed_by: closedBy ?? user.email ?? user.id,
      notes:     notes ?? null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function closeWeekByDefinition(
  weekNumber: number, year: number, month: number,
  startDate: string, endDate: string,
  closedBy?: string, notes?: string
): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already exists
  const { data: existing } = await supabase
    .from('week_closures')
    .select('id')
    .eq('year', year)
    .eq('month', month)
    .eq('week_number', weekNumber)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('week_closures')
      .update({ closed_at: new Date().toISOString(), closed_by: closedBy ?? user.email, notes: notes ?? null })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    // Insert new closure record
    const { error } = await supabase
      .from('week_closures')
      .insert({
        user_id:     user.id,
        week_number: weekNumber,
        year,
        month,
        start_date:  startDate,
        end_date:    endDate,
        total_income:   0,
        total_expenses: 0,
        net_profit:     0,
        notes:       notes ?? null,
        closed_at:   new Date().toISOString(),
      })
    if (error) throw new Error(error.message)
  }
}

export async function reopenWeek(id: number, notes?: string): Promise<void> {
  const supabase = getSupabase()

  if (id < 0) throw new Error('Week not found in database.')

  const { error } = await supabase
    .from('week_closures')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount)
