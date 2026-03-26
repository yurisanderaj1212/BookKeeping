import { apiClient } from './apiClient'

export interface PlaidItemInfo {
  id:              number
  institutionName: string | null
  institutionId:   string | null
  createdAt:       string
}

export interface LinkTokenResponse {
  linkToken: string
}

/** Obtiene el link_token para inicializar Plaid Link */
export async function createLinkToken(): Promise<LinkTokenResponse> {
  return apiClient<LinkTokenResponse>('/plaid/link-token', { method: 'POST' })
}

/** Intercambia el public_token por un access_token en el backend */
export async function exchangeToken(
  publicToken: string,
  institutionId:   string | null,
  institutionName: string | null
): Promise<{ message: string }> {
  return apiClient('/plaid/exchange-token', {
    method: 'POST',
    body: JSON.stringify({ publicToken, institutionId, institutionName }),
  })
}

/** Lista las conexiones bancarias del usuario */
export async function getPlaidItems(): Promise<PlaidItemInfo[]> {
  return apiClient<PlaidItemInfo[]>('/plaid/items')
}

/** Sincroniza transacciones de un Item */
export async function syncItem(itemId: number): Promise<{ added: number; modified: number; removed: number }> {
  return apiClient(`/plaid/sync/${itemId}`, { method: 'POST' })
}

/** Desconecta una cuenta bancaria */
export async function removeItem(itemId: number): Promise<void> {
  return apiClient(`/plaid/items/${itemId}`, { method: 'DELETE' })
}

export interface PendingTransaction {
  id:              number
  amount:          number
  type:            number   // 1 = ingreso, 2 = gasto (TransactionType enum)
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

/** Transacciones de Plaid pendientes de clasificar (paginado) */
export async function getPendingReview(page = 1, pageSize = 25): Promise<PendingReviewResponse> {
  return apiClient<PendingReviewResponse>(`/plaid/pending-review?page=${page}&pageSize=${pageSize}`)
}

/** El usuario clasifica una transacción como del negocio o personal */
export async function reviewTransaction(
  transactionId: number,
  body: ReviewRequest
): Promise<{ message: string }> {
  return apiClient(`/plaid/review/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
