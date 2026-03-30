// Supabase Edge Function — stripe-checkout
// Secrets needed (Dashboard → Edge Functions → Manage Secrets):
//   STRIPE_SECRET_KEY      = sk_test_...
//   STRIPE_WEBHOOK_SECRET  = whsec_...
//   SITE_URL               = http://localhost:3000

import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const PRICE_IDS = {
  monthly: 'price_1SpEVxAi6EmNmon2ugGHLUZi',
  annual:  'price_1TFjjGAi6EmNmon23kLE8ftG',
}

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:3000'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url  = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    // ── Webhook ───────────────────────────────────────────────────────────────
    if (path === 'webhook') {
      const sig    = req.headers.get('stripe-signature') ?? ''
      const body   = await req.text()
      const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

      let event: Stripe.Event
      try {
        event = await stripe.webhooks.constructEventAsync(body, sig, secret)
      } catch (err) {
        return new Response(`Webhook Error: ${err}`, { status: 400 })
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )

      if (event.type === 'checkout.session.completed') {
        const session  = event.data.object as Stripe.Checkout.Session
        const userId   = session.metadata?.user_id
        if (userId) {
          const sub    = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = sub.items.data[0].price.id
          const plan    = priceId === PRICE_IDS.annual ? 2 : 1
          await supabase.from('subscriptions').upsert({
            user_id:                userId,
            status:                 1,
            plan,
            stripe_customer_id:     session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_price_id:        priceId,
            current_period_start:   new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end:     new Date(sub.current_period_end   * 1000).toISOString(),
            updated_at:             new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
      } else if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice
        await supabase.from('subscriptions')
          .update({ status: 2, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', invoice.customer as string)
      } else if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('subscriptions')
          .update({ status: 3, canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
      } else if (event.type === 'customer.subscription.updated') {
        const sub     = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0].price.id
        const plan    = priceId === PRICE_IDS.annual ? 2 : 1
        await supabase.from('subscriptions')
          .update({
            status:               sub.status === 'active' ? 1 : 2,
            plan,
            stripe_price_id:      priceId,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
            updated_at:           new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
      }

      return json({ received: true })
    }

    // ── Rutas autenticadas ────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const body   = await req.json()
    const action = body.action as string

    // ── createCheckoutSession ─────────────────────────────────────────────────
    if (action === 'createCheckoutSession') {
      const plan    = body.plan as 'monthly' | 'annual'
      const priceId = PRICE_IDS[plan]
      if (!priceId) return json({ error: 'Invalid plan' }, 400)

      const { data: sub } = await supabase
        .from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()

      let customerId = sub?.stripe_customer_id as string | undefined
      if (!customerId) {
        const customer = await stripe.customers.create({
          email:    user.email,
          metadata: { user_id: user.id },
        })
        customerId = customer.id
      }

      const session = await stripe.checkout.sessions.create({
        customer:    customerId,
        mode:        'subscription',
        line_items:  [{ price: priceId, quantity: 1 }],
        metadata:    { user_id: user.id },
        success_url: `${SITE_URL}/es/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${SITE_URL}/es/subscribe/cancel`,
        allow_promotion_codes: true,
      })

      return json({ url: session.url, sessionId: session.id })
    }

    // ── createPortalSession ───────────────────────────────────────────────────
    if (action === 'createPortalSession') {
      const { data: sub } = await supabase
        .from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()

      const customerId = sub?.stripe_customer_id
      if (!customerId) return json({ error: 'No active subscription found' }, 400)

      const portal = await stripe.billingPortal.sessions.create({
        customer:   customerId,
        return_url: `${SITE_URL}/es/settings/billing`,
      })

      return json({ url: portal.url })
    }

    return json({ error: 'Unknown action' }, 400)

  } catch (err) {
    console.error('stripe-checkout error:', err)
    return json({ error: String(err) }, 500)
  }
})
