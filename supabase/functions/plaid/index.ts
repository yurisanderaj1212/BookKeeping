// Supabase Edge Function — plaid
// Secrets needed (Dashboard → Edge Functions → Manage Secrets):
//   PLAID_CLIENT_ID  = 69bb2e17d280d3000c6058fb
//   PLAID_SECRET     = dc715d73b93fd57ce3e91f7f2c3cb1
//   PLAID_ENV        = sandbox
//
// Webhook URL to register in Plaid Dashboard:
//   https://<project-ref>.supabase.co/functions/v1/plaid
// For production: change PLAID_ENV=production and PLAID_SECRET to production key

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID')!
const PLAID_SECRET    = Deno.env.get('PLAID_SECRET')!
const PLAID_ENV       = Deno.env.get('PLAID_ENV') ?? 'sandbox'
const PLAID_BASE_URL  = `https://${PLAID_ENV}.plaid.com`

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function plaidPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${PLAID_BASE_URL}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, ...body }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_message ?? `Plaid error ${res.status}: ${JSON.stringify(data)}`)
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Read body once — needed for both webhook detection and action handling
  const rawBody = await req.text()
  let parsedBody: any
  try { parsedBody = JSON.parse(rawBody) } catch { parsedBody = {} }

  // ── Plaid Webhook (no Authorization header — Plaid calls this directly) ────
  // Plaid sends: { webhook_type, webhook_code, item_id, ... }
  // Our actions always include an "action" field, so we can distinguish them
  if (parsedBody?.webhook_type && parsedBody?.item_id && !parsedBody?.action) {
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { webhook_type, webhook_code, item_id: plaidItemId } = parsedBody
    console.log(`Plaid webhook: ${webhook_type}/${webhook_code} for item ${plaidItemId}`)

    if (webhook_type === 'TRANSACTIONS') {
      const { data: itemRow } = await adminSupabase
        .from('plaid_items')
        .select('id, user_id, plaid_access_token')
        .eq('plaid_item_id', plaidItemId)
        .single()

      if (itemRow && ['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE'].includes(webhook_code)) {
        try {
          // Rebuild accountMap from existing accounts in DB
          const { data: existingAccounts } = await adminSupabase
            .from('accounts')
            .select('id, description')
            .eq('user_id', itemRow.user_id)
            .like('description', '%[plaid:%')

          const accountMap = new Map<string, number>()
          for (const acc of existingAccounts ?? []) {
            const match = acc.description?.match(/\[plaid:([^\]]+)\]/)
            if (match) accountMap.set(match[1], acc.id)
          }

          const result = await syncTransactions(
            itemRow.plaid_access_token,
            itemRow.id,
            itemRow.user_id,
            adminSupabase,
            accountMap,
          )
          console.log(`Auto-sync complete: +${result.added} ~${result.modified} -${result.removed}`)
        } catch (err) {
          console.error('Auto-sync error:', err)
        }
      }
    }

    return json({ received: true })
  }

  // ── All other actions require user auth ───────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const body   = parsedBody
  const action = body.action as string

  try {
    // ── createLinkToken ───────────────────────────────────────────────────────
    if (action === 'createLinkToken') {
      const linkTokenBody: Record<string, unknown> = {
        user:          { client_user_id: user.id },
        client_name:   'Chill Numbers',
        products:      ['transactions'],
        country_codes: ['US'],
        language:      'en',
      }
      // Required for OAuth institutions in production
      if (PLAID_ENV === 'production') {
        linkTokenBody.redirect_uri = 'https://www.chillnumbers.com/en/plaid-oauth'
      }
      const data = await plaidPost('/link/token/create', linkTokenBody)
      return json({ linkToken: data.link_token })
    }

    // ── exchangeToken ─────────────────────────────────────────────────────────
    if (action === 'exchangeToken') {
      const { publicToken, institutionId, institutionName } = body

      const exchangeData = await plaidPost('/item/public_token/exchange', {
        public_token: publicToken,
      })

      const accessToken = exchangeData.access_token
      const itemId      = exchangeData.item_id

      // Register webhook so Plaid auto-notifies on new transactions
      const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid`
      try {
        await plaidPost('/item/webhook/update', {
          access_token: accessToken,
          webhook:      webhookUrl,
        })
      } catch (e) {
        console.warn('Webhook registration failed (non-critical):', e)
      }

      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )

      // Create one Supabase account per Plaid account
      const accountMap = await createAccountsFromPlaid(
        adminSupabase, user.id, institutionName, accessToken
      )
      // Primary account ID = first account (for backward compat with plaid_items.supabase_account_id)
      const primaryAccountId = accountMap.size > 0 ? accountMap.values().next().value : null

      const { data: item, error } = await adminSupabase
        .from('plaid_items')
        .insert({
          user_id:             user.id,
          plaid_item_id:       itemId,
          plaid_access_token:  accessToken,
          institution_id:      institutionId,
          institution_name:    institutionName,
          supabase_account_id: primaryAccountId,
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message)

      const result = await syncTransactions(accessToken, item.id, user.id, adminSupabase, accountMap)
      return json({ message: 'Cuenta conectada exitosamente', ...result })
    }

    // ── getItems ──────────────────────────────────────────────────────────────
    if (action === 'getItems') {
      const { data, error } = await supabase
        .from('plaid_items')
        .select('id, institution_name, institution_id, created_at')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return json((data ?? []).map((i: any) => ({
        id:              i.id,
        institutionName: i.institution_name,
        institutionId:   i.institution_id,
        createdAt:       i.created_at,
      })))
    }

    // ── syncItem ──────────────────────────────────────────────────────────────
    if (action === 'syncItem') {
      const { itemId } = body

      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )

      const { data: item, error } = await supabase
        .from('plaid_items')
        .select('plaid_access_token')
        .eq('id', itemId)
        .single()

      if (error || !item) return json({ error: 'Item not found' }, 404)

      // Rebuild accountMap from existing accounts
      const { data: existingAccounts } = await adminSupabase
        .from('accounts')
        .select('id, description')
        .eq('user_id', user.id)
        .like('description', '%[plaid:%')

      const accountMap = new Map<string, number>()
      for (const acc of existingAccounts ?? []) {
        const match = acc.description?.match(/\[plaid:([^\]]+)\]/)
        if (match) accountMap.set(match[1], acc.id)
      }

      const result = await syncTransactions(item.plaid_access_token, itemId, user.id, adminSupabase, accountMap)
      return json(result)
    }

    // ── removeItem ────────────────────────────────────────────────────────────
    if (action === 'removeItem') {
      const { itemId } = body

      const { data: item, error } = await supabase
        .from('plaid_items')
        .select('plaid_access_token')
        .eq('id', itemId)
        .single()

      if (error || !item) return json({ error: 'Item not found' }, 404)

      try {
        await plaidPost('/item/remove', { access_token: item.plaid_access_token })
      } catch { /* ignorar si ya fue removido en Plaid */ }

      // Delete associated bank accounts from Supabase
      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      // Get the item to find associated accounts
      const { data: itemToDelete } = await supabase
        .from('plaid_items')
        .select('supabase_account_id, institution_name')
        .eq('id', itemId)
        .single()

      if (itemToDelete?.institution_name) {
        // Delete all accounts from this institution (created by Plaid)
        // First null out account_id on transactions to avoid FK violation
        await adminSupabase
          .from('transactions')
          .update({ account_id: null })
          .like('account_id::text', '%')
          .in('account_id', 
            (await adminSupabase
              .from('accounts')
              .select('id')
              .like('name', `${itemToDelete.institution_name}%`)
              .then(r => (r.data ?? []).map((a: any) => a.id))
            )
          )
        await adminSupabase
          .from('accounts')
          .delete()
          .like('name', `${itemToDelete.institution_name}%`)
          .neq('sub_type', 1002) // never delete Cash
      }

      await supabase.from('plaid_items').delete().eq('id', itemId)
      return json({ message: 'Cuenta desconectada' })
    }

    return json({ error: 'Unknown action' }, 400)

  } catch (err) {
    console.error('plaid error:', err)
    return json({ error: String(err) }, 500)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Create one Supabase account per Plaid account ────────────────────────────
// Returns a Map<plaid_account_id, supabase_account_id>
async function createAccountsFromPlaid(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  institutionName: string | null,
  accessToken: string,
): Promise<Map<string, number>> {
  const accountMap = new Map<string, number>()

  let plaidAccounts: any[] = []
  try {
    const accountsData = await plaidPost('/accounts/get', { access_token: accessToken })
    plaidAccounts = accountsData.accounts ?? []
  } catch (e) {
    console.error('Failed to fetch Plaid accounts:', e)
    return accountMap
  }

  for (const acc of plaidAccounts) {
    const plaidAccountId = acc.account_id
    // Log account details to diagnose balance issues
    console.log(`Plaid account: ${acc.name} | type: ${acc.type} | subtype: ${acc.subtype} | balance: ${acc.balances?.current}`)
    const isCredit = acc.type === 'credit' || acc.type === 'loan'
    const bal = acc.balances?.current ?? 0
    // For depository accounts: use balance as-is (positive = money you have)
    // For credit/loan: Plaid positive = amount owed → store as negative
    // Special case: if depository balance is negative (overdraft), keep it negative
    const balance = isCredit ? -Math.abs(bal) : bal

    // Account type: 1=Asset (depository/investment), 2=Liability (credit/loan)
    const accountType = isCredit ? 2 : 1
    // Sub-type: 1001=BankAccount, 2002=CreditCard, 2003=Loan
    const subType = acc.subtype === 'credit card' ? 2002
      : acc.type === 'loan' ? 2003
      : 1001

    const accountName = acc.name
      ? `${institutionName ?? ''} — ${acc.name}`.trim()
      : (institutionName ?? 'Bank Account')

    // Check if already exists by plaid_account_id stored in description
    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .like('description', `%[plaid:${plaidAccountId}]%`)
      .maybeSingle()

    if (existing) {
      // Update balance on reconnect
      const { error: updateErr } = await supabase
        .from('accounts')
        .update({ current_balance: balance, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (!updateErr) accountMap.set(plaidAccountId, existing.id)
      continue
    }

    const { data: newAcc, error } = await supabase
      .from('accounts')
      .insert({
        user_id:         userId,
        name:            accountName,
        type:            accountType,
        sub_type:        subType,
        initial_balance: balance,
        current_balance: balance,
        currency:        acc.balances?.iso_currency_code ?? 'USD',
        is_active:       true,
        description:     `${acc.official_name ?? acc.name} — via Plaid [plaid:${plaidAccountId}]`,
      })
      .select('id')
      .single()

    if (!error && newAcc) {
      accountMap.set(plaidAccountId, newAcc.id)
    } else if (error) {
      console.error('Error creating account:', error.message)
    }
  }

  return accountMap
}

// ── /transactions/sync con cursor incremental ─────────────────────────────────
async function syncTransactions(
  accessToken: string,
  plaidItemDbId: number,
  userId: string,
  supabase: ReturnType<typeof createClient>,
  accountMap?: Map<string, number>,
): Promise<{ added: number; modified: number; removed: number }> {

  const { data: itemRow } = await supabase
    .from('plaid_items')
    .select('transactions_cursor, supabase_account_id')
    .eq('id', plaidItemDbId)
    .single()

  let cursor: string | null = itemRow?.transactions_cursor ?? null
  const primaryAccountId: number | null = itemRow?.supabase_account_id ?? null

  let added = 0, modified = 0, removed = 0
  let hasMore = true

  while (hasMore) {
    const reqBody: Record<string, unknown> = { access_token: accessToken, count: 100 }
    if (cursor) reqBody.cursor = cursor

    const data = await plaidPost('/transactions/sync', reqBody)

    // Update account balances from Plaid — only for accounts in the map
    if (data.accounts?.length > 0) {
      for (const acc of data.accounts) {
        // Only update if we have a mapping for this specific plaid account
        const supabaseAccId = accountMap?.get(acc.account_id)
        if (!supabaseAccId) {
          console.log(`Skipping balance update for unmapped account: ${acc.account_id} (${acc.name})`)
          continue
        }
        const bal = acc.balances?.current ?? 0
        const isCredit = acc.type === 'credit' || acc.type === 'loan'
        const balance = isCredit ? -Math.abs(bal) : bal
        await supabase
          .from('accounts')
          .update({ current_balance: balance, updated_at: new Date().toISOString() })
          .eq('id', supabaseAccId)
      }
    }

    for (const tx of data.added ?? []) {
      const type   = tx.amount > 0 ? 2 : 1
      const amount = Math.abs(tx.amount)
      // Map to the correct Supabase account — only assign if we have a mapping
      const txAccountId = accountMap?.get(tx.account_id) ?? null
      const { error } = await supabase.from('transactions').upsert({
        user_id:                 userId,
        type,
        amount,
        category_id:             15,
        account_id:              txAccountId,
        description:             tx.merchant_name ?? tx.name ?? 'Transacción bancaria',
        date:                    tx.authorized_date ?? tx.date,
        status:                  1,
        is_from_plaid:           true,
        is_business_transaction: null,
        merchant_name:           tx.merchant_name ?? null,
        plaid_transaction_id:    tx.transaction_id,
        notes:                   `Plaid item: ${plaidItemDbId}`,
      }, { onConflict: 'plaid_transaction_id', ignoreDuplicates: false })
      if (!error) added++
    }

    for (const tx of data.modified ?? []) {
      const type   = tx.amount > 0 ? 2 : 1
      const amount = Math.abs(tx.amount)
      const { error } = await supabase.from('transactions')
        .update({
          amount, type,
          description:   tx.merchant_name ?? tx.name ?? 'Transacción bancaria',
          date:          tx.authorized_date ?? tx.date,
          merchant_name: tx.merchant_name ?? null,
          updated_at:    new Date().toISOString(),
        })
        .eq('plaid_transaction_id', tx.transaction_id)
      if (!error) modified++
    }

    for (const tx of data.removed ?? []) {
      await supabase.from('transactions')
        .delete()
        .eq('plaid_transaction_id', tx.transaction_id)
        .eq('is_business_transaction', null)
      removed++
    }

    cursor  = data.next_cursor
    hasMore = data.has_more
  }

  await supabase
    .from('plaid_items')
    .update({ transactions_cursor: cursor, updated_at: new Date().toISOString() })
    .eq('id', plaidItemDbId)

  return { added, modified, removed }
}
