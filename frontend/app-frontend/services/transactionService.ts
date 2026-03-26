import { apiClient } from '@/lib/apiClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
})

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateTransactionDto {
  type: 1 | 2        // 1=Income, 2=Expense
  amount: number
  categoryId: number
  description: string
  date: string
  accountId?: number
  notes?: string
}

export interface UpdateTransactionDto {
  type?: 1 | 2
  amount?: number
  categoryId?: number
  description?: string
  date?: string
  accountId?: number | null
  notes?: string
}

export interface TransactionDto {
  id: number
  type: 1 | 2        // 1=Income, 2=Expense
  amount: number
  categoryId: number
  categoryName?: string
  description: string
  date: string
  createdAt: string
  accountId?: number
  accountName?: string
  notes?: string
  status?: number
  isFromPlaid?: boolean
  isBusinessTransaction?: boolean | null
  merchantName?: string | null
}

// ─── Paginación ──────────────────────────────────────────────────────────────

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

// ─── Query params ─────────────────────────────────────────────────────────────

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

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function getAll(): Promise<TransactionDto[]> {
  const response = await fetch(`${API_URL}/transactions`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Error al obtener transacciones')
  return response.json()
}

export async function getFiltered(params: TransactionQueryParameters): Promise<PagedResult<TransactionDto>> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query.set(k, String(v))
  })
  const response = await fetch(`${API_URL}/transactions/filtered?${query}`, { headers: getAuthHeaders() })
  if (response.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/auth/login'
    throw new Error('Sesión expirada')
  }
  if (!response.ok) throw new Error('Error al obtener transacciones')
  const raw = await response.json()
  // El backend puede devolver { data, pagination } o un array directo
  if (Array.isArray(raw)) {
    return {
      data: raw,
      pagination: { currentPage: 1, pageSize: raw.length, totalRecords: raw.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
    }
  }
  return raw
}

export async function create(transaction: CreateTransactionDto): Promise<TransactionDto> {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction)
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Error al crear transacción')
  }
  return response.json()
}

export async function update(id: number, transaction: UpdateTransactionDto): Promise<TransactionDto> {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction)
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Error al actualizar transacción')
  }
  return response.json()
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Error al eliminar transacción')
}
