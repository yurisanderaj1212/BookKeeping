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
          const result = await syncTransactions(
            itemRow.plaid_access_token,
            itemRow.id,
            itemRow.user_id,
            adminSupabase,
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
        linkTokenBody.redirect_uri = 'https://www.chillnumbers.com'
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

      const supabaseAccountId = await getOrCreateAccount(
        adminSupabase, user.id, institutionName, accessToken
      )

      const { data: item, error } = await adminSupabase
        .from('plaid_items')
        .insert({
          user_id:             user.id,
          plaid_item_id:       itemId,
          plaid_access_token:  accessToken,
          institution_id:      institutionId,
          institution_name:    institutionName,
          supabase_account_id: supabaseAccountId,
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message)

      const result = await syncTransactions(accessToken, item.id, user.id, adminSupabase)
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

      const result = await syncTransactions(item.plaid_access_token, itemId, user.id, adminSupabase)
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

async function getOrCreateAccount(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  institutionName: string | null,
  accessToken?: string,
): Promise<number | null> {
  if (!institutionName) return null

  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', `%${institutionName}%`)
    .maybeSingle()

  if (existing) return existing.id

  let currentBalance = 0
  if (accessToken) {
    try {
      const accountsData = await plaidPost('/accounts/get', { access_token: accessToken })
      currentBalance = (accountsData.accounts ?? []).reduce((sum: number, acc: any) => {
        return sum + (acc.balances?.current ?? 0)
      }, 0)
    } catch { /* si falla, usar 0 */ }
  }

  const { data: newAccount, error } = await supabase
    .from('accounts')
    .insert({
      user_id:         userId,
      name:            institutionName,
      type:            1,
      sub_type:        1001,
      initial_balance: currentBalance,
      current_balance: currentBalance,
      currency:        'USD',
      is_active:       true,
      description:     'Cuenta bancaria conectada via Plaid',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating account:', error.message)
    return null
  }

  return newAccount?.id ?? null
}

// ── /transactions/sync con cursor incremental ─────────────────────────────────
async function syncTransactions(
  accessToken: string,
  plaidItemDbId: number,
  userId: string,
  supabase: ReturnType<typeof createClient>,
): Promise<{ added: number; modified: number; removed: number }> {

  const { data: itemRow } = await supabase
    .from('plaid_items')
    .select('transactions_cursor, supabase_account_id')
    .eq('id', plaidItemDbId)
    .single()

  let cursor: string | null = itemRow?.transactions_cursor ?? null
  const supabaseAccountId: number | null = itemRow?.supabase_account_id ?? null

  let added = 0, modified = 0, removed = 0
  let hasMore = true

  while (hasMore) {
    const reqBody: Record<string, unknown> = { access_token: accessToken, count: 100 }
    if (cursor) reqBody.cursor = cursor

    const data = await plaidPost('/transactions/sync', reqBody)

    // Update account balance from Plaid
    if (supabaseAccountId && data.accounts?.length > 0) {
      const totalBalance = data.accounts.reduce((sum: number, acc: any) => {
        return sum + (acc.balances?.current ?? 0)
      }, 0)
      await supabase
        .from('accounts')
        .update({ current_balance: totalBalance, updated_at: new Date().toISOString() })
        .eq('id', supabaseAccountId)
    }

    for (const tx of data.added ?? []) {
      const type   = tx.amount > 0 ? 2 : 1
      const amount = Math.abs(tx.amount)
      const { error } = await supabase.from('transactions').upsert({
        user_id:                 userId,
        type,
        amount,
        category_id:             15,
        account_id:              supabaseAccountId,
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
