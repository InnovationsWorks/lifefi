import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// Lazily created so missing env var doesn't crash build-time evaluation
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, key)
}

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_PERSONAL_PRICE_ID ?? '']: 'personal',
  [process.env.NEXT_PUBLIC_STRIPE_BIZFI_PRICE_ID    ?? '']: 'bizfi',
  [process.env.NEXT_PUBLIC_STRIPE_DUO_PRICE_ID      ?? '']: 'duo',
}

async function updatePlanByCustomer(customerId: string, plan: string) {
  await getSupabaseAdmin()
    .from('profiles')
    .update({ subscription_tier: plan })
    .eq('stripe_customer_id', customerId)
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature error'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.userId
        if (!userId || !session.subscription) break

        const sub     = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan    = PRICE_TO_PLAN[priceId] ?? 'personal'

        await getSupabaseAdmin()
          .from('profiles')
          .update({ subscription_tier: plan, stripe_customer_id: session.customer as string })
          .eq('id', userId)
        break
      }

      case 'customer.subscription.updated': {
        const sub      = event.data.object as Stripe.Subscription
        const priceId  = sub.items.data[0]?.price.id ?? ''
        const plan     = PRICE_TO_PLAN[priceId] ?? 'personal'
        if (['active', 'trialing'].includes(sub.status)) {
          await updatePlanByCustomer(sub.customer as string, plan)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await updatePlanByCustomer(sub.customer as string, 'free')
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
