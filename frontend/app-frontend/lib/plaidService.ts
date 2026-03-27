/**
 * plaidService — Plaid integration stubs.
 *
 * Plaid requires a server-side backend to exchange tokens securely.
 * These functions will be wired to a Supabase Edge Function when ready.
 * Until then, ConnectedBanks is hidden via NEXT_PUBLIC_PLAID_CLIENT_ID check.
 */

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

const NOT_CONFIGURED = 'Plaid requires a Supabase Edge Function. Set NEXT_PUBLIC_PLAID_CLIENT_ID when ready.'

export async function createLinkToken(): Promise<{ linkToken: string }> {
  throw new Error(NOT_CONFIGURED)
}

export async function exchangeToken(
  _publicToken: string,
  _institutionId: string | null,
  _institutionName: string | null
): Promise<{ message: string }> {
  throw new Error(NOT_CONFIGURED)
}

export async function getPlaidItems(): Promise<PlaidItemInfo[]> {
  // Return empty array so ConnectedBanks renders the empty state gracefully
  return []
}

export async function syncItem(_itemId: number): Promise<{ added: number; modified: number; removed: number }> {
  throw new Error(NOT_CONFIGURED)
}

export async function removeItem(_itemId: number): Promise<void> {
  throw new Error(NOT_CONFIGURED)
}

export async function getPendingReview(_page = 1, _pageSize = 25): Promise<PendingReviewResponse> {
  return { data: [], page: 1, pageSize: 25, totalCount: 0, totalPages: 0, hasMore: false }
}

export async function reviewTransaction(
  _transactionId: number,
  _body: ReviewRequest
): Promise<{ message: string }> {
  throw new Error(NOT_CONFIGURED)
}
