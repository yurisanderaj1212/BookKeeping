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
    // No subscription row yet — return default trial
    return {
      status: 'Trial', plan: 'Free', hasActiveAccess: true,
      trialDaysRemaining: 30, trialEndsAt: null,
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

  const hasActiveAccess = status === 'Trial'
    ? trialDaysRemaining > 0
    : status === 'Active'

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

// Stripe Checkout — requires a backend/Edge Function
// These are stubs that will be wired to Stripe when the Edge Function is ready
export async function createCheckoutSession(_plan: 'monthly' | 'annual'): Promise<{ url: string; sessionId: string }> {
  throw new Error('Stripe checkout requires a backend Edge Function. Configure NEXT_PUBLIC_STRIPE_FUNCTION_URL.')
}

export async function createPortalSession(): Promise<{ url: string }> {
  throw new Error('Stripe portal requires a backend Edge Function. Configure NEXT_PUBLIC_STRIPE_FUNCTION_URL.')
}
