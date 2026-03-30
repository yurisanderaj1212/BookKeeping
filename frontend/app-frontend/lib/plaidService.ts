import { getSupabase } from '@/lib/supabaseClient'

export interface PlaidItemInfo {
  id:              number
  institutionName: string | null
  institutionId:   string | null
  createdAt:       string
}

export interface PendingTransaction {
  id:              number
  amount:          number
  type:            number
  description:     string | null
  merchantName:    string | null
  date:            string
  categoryId:      number
  category:        string
  accountId:       number | null
  plaidItemId:     number | null
  institutionName: string | null
}

export interface ReviewRequest {
  isBusiness:   boolean
  categoryId?:  number
  description?: string
  accountId?:   number
}

export interface PendingReviewResponse {
  data:       PendingTransaction[]
  page:       number
  pageSize:   number
  totalCount: number
  totalPages: number
  hasMore:    boolean
}

function getEdgeFunctionUrl(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/plaid`
}

async function callEdgeFunction(action: string, payload?: Record<string, unknown>) {
  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa.')

  const res = await fetch(getEdgeFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey':        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({ action, ...payload }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
  return data
}

export async function createLinkToken(): Promise<{ linkToken: string }> {
  return callEdgeFunction('createLinkToken')
}

export async function exchangeToken(
  publicToken: string,
  institutionId: string | null,
  institutionName: string | null,
): Promise<{ message: string }> {
  return callEdgeFunction('exchangeToken', { publicToken, institutionId, institutionName })
}

export async function getPlaidItems(): Promise<PlaidItemInfo[]> {
  return callEdgeFunction('getItems')
}

export async function syncItem(itemId: number): Promise<{ added: number; modified: number; removed: number }> {
  return callEdgeFunction('syncItem', { itemId })
}

export async function removeItem(itemId: number): Promise<void> {
  await callEdgeFunction('removeItem', { itemId })
}

export async function getPendingReview(page = 1, pageSize = 25): Promise<PendingReviewResponse> {
  const supabase = getSupabase()
  const from = (page - 1) * pageSize
  const to   = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*, categories(name), accounts(id, name)', { count: 'exact' })
    .eq('is_from_plaid', true)
    .eq('status', 1)
    .order('date', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)

  const total = count ?? 0
  const mapped: PendingTransaction[] = (data ?? []).map((r: any) => ({
    id:              r.id,
    amount:          r.amount,
    type:            r.type,
    description:     r.description,
    merchantName:    r.merchant_name,
    date:            r.date,
    categoryId:      r.category_id,
    category:        r.categories?.name ?? '',
    accountId:       r.account_id ?? null,
    plaidItemId:     null,
    institutionName: r.accounts?.name ?? null,
  }))

  return {
    data:       mapped,
    page,
    pageSize,
    totalCount: total,
    totalPages: Math.ceil(total / pageSize),
    hasMore:    page * pageSize < total,
  }
}

export async function reviewTransaction(
  transactionId: number,
  body: ReviewRequest,
): Promise<{ message: string }> {
  const supabase = getSupabase()

  if (!body.isBusiness) {
    // No es del negocio — eliminar la transacción
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
    if (error) throw new Error(error.message)
    return { message: 'Transacción descartada' }
  }

  // Es del negocio — actualizar con los datos configurados
  const patch: Record<string, unknown> = {
    status:                  0, // Completed
    is_business_transaction: true,
    updated_at:              new Date().toISOString(),
  }
  if (body.categoryId)  patch.category_id = body.categoryId
  if (body.description) patch.description = body.description
  if (body.accountId !== undefined) patch.account_id = body.accountId ?? null

  const { error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', transactionId)

  if (error) throw new Error(error.message)
  return { message: 'Transacción confirmada' }
}
