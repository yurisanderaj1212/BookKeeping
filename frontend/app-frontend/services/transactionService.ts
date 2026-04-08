import { getSupabase } from '@/lib/supabaseClient'

export interface CreateTransactionDto {
  type: 1 | 2
  amount: number
  category_id?: number
  categoryId?: number   // alias
  description: string
  date: string
  account_id?: number
  accountId?: number    // alias
  notes?: string
  status?: number       // 0=completed, 1=pending
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionDto {
  id: number
  user_id: string
  type: 1 | 2
  amount: number
  category_id: number
  category_name?: string
  description: string
  date: string
  account_id?: number
  account_name?: string
  notes?: string
  status: number
  is_from_plaid: boolean
  is_business_transaction?: boolean | null
  merchant_name?: string | null
  created_at: string
  // camelCase aliases
  categoryId: number
  categoryName?: string
  accountId?: number
  accountName?: string
  createdAt: string
  isFromPlaid: boolean
  isBusinessTransaction?: boolean | null
  merchantName?: string | null
}

export interface PaginationMetadata {
  currentPage: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PagedResult<T> {
  data: T[]
  pagination: PaginationMetadata
}

export interface TransactionQueryParameters {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  searchText?: string
  type?: 1 | 2
  categoryId?: number
  categoryIds?: string
  accountId?: number
  accountIds?: string
  startDate?: string
  endDate?: string
}

function mapTx(r: any): TransactionDto {
  return {
    ...r,
    categoryId: r.category_id, categoryName: r.categories?.name ?? r.category_name,
    accountId: r.account_id, accountName: r.accounts?.name ?? r.account_name,
    createdAt: r.created_at, isFromPlaid: r.is_from_plaid,
    isBusinessTransaction: r.is_business_transaction, merchantName: r.merchant_name,
    category_name: r.categories?.name ?? r.category_name,
    account_name: r.accounts?.name ?? r.account_name,
  }
}

export async function getFiltered(params: TransactionQueryParameters): Promise<PagedResult<TransactionDto>> {
  const supabase = getSupabase()
  const page = params.pageNumber ?? 1
  const size = params.pageSize ?? 20
  const from = (page - 1) * size
  const to = from + size - 1

  let query = supabase
    .from('transactions')
    .select('*, categories(name), accounts(name)', { count: 'exact' })
    // Excluir transacciones de Plaid que aún no han sido revisadas
    .or('is_from_plaid.eq.false,is_business_transaction.eq.true')

  if (params.type) query = query.eq('type', params.type)
  if (params.startDate) query = query.gte('date', params.startDate)
  if (params.endDate) query = query.lte('date', params.endDate)
  if (params.searchText) query = query.ilike('description', `%${params.searchText}%`)
  if (params.categoryId) query = query.eq('category_id', params.categoryId)
  if (params.accountId) query = query.eq('account_id', params.accountId)

  const sortCol = params.sortBy === 'date' ? 'date' : 'created_at'
  query = query.order(sortCol, { ascending: params.sortDirection === 'asc' })
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  const total = count ?? 0
  const totalPages = Math.ceil(total / size)

  const mapped: TransactionDto[] = (data ?? []).map(mapTx)

  return {
    data: mapped,
    pagination: {
      currentPage: page, pageSize: size, totalRecords: total,
      totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1
    }
  }
}

export async function getAll(): Promise<TransactionDto[]> {
  const result = await getFiltered({ pageSize: 5000 })
  return result.data
}

export async function create(dto: CreateTransactionDto): Promise<TransactionDto> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay sesión activa.')

  const payload = {
    user_id:     user.id,
    type:        dto.type,
    amount:      dto.amount,
    description: dto.description || '',
    date:        dto.date,
    notes:       dto.notes,
    category_id: dto.category_id ?? dto.categoryId,
    account_id:  dto.account_id ?? dto.accountId ?? null,
    is_from_plaid:           false,
    is_business_transaction: true,
    status:                  dto.status ?? 0,
  }
  const { data, error } = await supabase
    .from('transactions').insert(payload)
    .select('*, categories(name), accounts(name)').single()
  if (error) throw new Error(error.message)
  return mapTx({ ...data, categories: { name: data.categories?.name }, accounts: { name: data.accounts?.name } })
}

export async function update(id: number, dto: UpdateTransactionDto): Promise<TransactionDto> {
  const supabase = getSupabase()
  const patch: any = { updated_at: new Date().toISOString() }
  if (dto.type !== undefined) patch.type = dto.type
  if (dto.amount !== undefined) patch.amount = dto.amount
  if (dto.description !== undefined) patch.description = dto.description
  if (dto.date !== undefined) patch.date = dto.date
  if (dto.notes !== undefined) patch.notes = dto.notes
  if (dto.status !== undefined) patch.status = dto.status
  const catId = dto.category_id ?? dto.categoryId
  if (catId !== undefined) patch.category_id = catId
  const accId = dto.account_id ?? dto.accountId
  if (accId !== undefined) patch.account_id = accId ?? null

  const { data, error } = await supabase
    .from('transactions').update(patch).eq('id', id)
    .select('*, categories(name), accounts(name)').single()
  if (error) throw new Error(error.message)
  return mapTx({ ...data, categories: { name: data.categories?.name }, accounts: { name: data.accounts?.name } })
}

export async function deleteTransaction(id: number): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
