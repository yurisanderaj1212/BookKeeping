/**
 * subscriptionService — cliente para los endpoints de suscripción.
 */
import { apiClient } from './apiClient'

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

export interface CheckoutResponse {
  url:       string
  sessionId: string
}

export interface PortalResponse {
  url: string
}

/** Obtiene el estado actual de la suscripción del usuario autenticado. */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  return apiClient<SubscriptionInfo>('/subscription/status')
}

/** Crea una sesión de Stripe Checkout y devuelve la URL de pago. */
export async function createCheckoutSession(plan: 'monthly' | 'annual'): Promise<CheckoutResponse> {
  return apiClient<CheckoutResponse>('/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}

/** Crea una sesión del Customer Portal de Stripe para gestionar la suscripción. */
export async function createPortalSession(): Promise<PortalResponse> {
  return apiClient<PortalResponse>('/subscription/portal', {
    method: 'POST',
  })
}
