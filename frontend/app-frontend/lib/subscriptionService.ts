import { getSupabase } from '@/lib/supabaseClient'

export type SubscriptionStatus = 'Trial' | 'Active' | 'PastDue' | 'Canceled' | 'Expired'
export type SubscriptionPlan   = 'Free' | 'Monthly' | 'Annual'

export interface SubscriptionInfo {
  status:             SubscriptionStatus
  plan:               SubscriptionPlan
  hasActiveAccess:    boolean
  trialDaysRemaining: number
  trialEndsAt:        string | null
  currentPeriodEnd:   string | null
  canceledAt:         string | null
  stripeCustomerId:   string | null
}

const STATUS_MAP: Record<number, SubscriptionStatus> = {
  0: 'Trial', 1: 'Active', 2: 'PastDue', 3: 'Canceled', 4: 'Expired',
}
const PLAN_MAP: Record<number, SubscriptionPlan> = {
  0: 'Free', 1: 'Monthly', 2: 'Annual',
}

// URL de la Edge Function — se construye automáticamente desde la URL de Supabase
function getEdgeFunctionUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/functions/v1/stripe-checkout`
}

// Llama a la Edge Function con el JWT del usuario actual
async function callEdgeFunction(action: string, payload?: Record<string, unknown>) {
  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa.')

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(getEdgeFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey':        supabaseAnon,
    },
    body: JSON.stringify({ action, ...payload }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
  return data
}

export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    // No subscription row yet — user needs to go through Stripe Checkout
    return {
      status: 'Trial', plan: 'Free', hasActiveAccess: false,
      trialDaysRemaining: 0, trialEndsAt: null,
      currentPeriodEnd: null, canceledAt: null, stripeCustomerId: null,
    }
  }

  const status = STATUS_MAP[data.status] ?? 'Expired'
  const plan   = PLAN_MAP[data.plan]   ?? 'Free'

  const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
  const now = new Date()
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // hasActiveAccess: Trial (Stripe manages end date) or Active
  const hasActiveAccess = status === 'Trial' || status === 'Active'

  return {
    status,
    plan,
    hasActiveAccess,
    trialDaysRemaining,
    trialEndsAt:       data.trial_ends_at ?? null,
    currentPeriodEnd:  data.current_period_end ?? null,
    canceledAt:        data.canceled_at ?? null,
    stripeCustomerId:  data.stripe_customer_id ?? null,
  }
}

export async function createCheckoutSession(plan: 'monthly' | 'annual'): Promise<{ url: string; sessionId: string }> {
  return callEdgeFunction('createCheckoutSession', { plan })
}

export async function createPortalSession(): Promise<{ url: string }> {
  return callEdgeFunction('createPortalSession')
}
