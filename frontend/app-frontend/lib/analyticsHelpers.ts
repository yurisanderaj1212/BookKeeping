import { getSupabase } from '@/lib/supabaseClient'

export function getPeriodDates(period: string, year: string, month: string): { start: string; end: string } {
  const now = new Date()
  if (period === 'week') {
    const day = now.getDay()
    const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0,0,0,0)
    const end   = new Date(start); end.setDate(start.getDate() + 6)
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
  }
  if (period === 'month') {
    const m = parseInt(month), y = parseInt(year)
    return { start: `${y}-${String(m).padStart(2,'0')}-01`, end: new Date(y, m, 0).toISOString().split('T')[0] }
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

export async function fetchTransactions(start: string, end: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('transactions')
    .select('id, type, amount, date, status, category_id, categories(name)')
    .gte('date', start).lte('date', end)
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({
    id:            r.id,
    type:          r.type as 1 | 2,
    amount:        r.amount as number,
    date:          r.date as string,
    status:        r.status as number,
    category_id:   r.category_id as number,
    category_name: r.categories?.name as string | undefined,
  }))
}
