import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { logApiError } from '@/lib/api/validation';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Interface for subscription data we need
interface SubscriptionData {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  trial_end: number | null;
  canceled_at: number | null;
}

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as SubscriptionData;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as SubscriptionData;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { subscription?: string };
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        logger.debug('Stripe webhook unhandled event', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logApiError('POST /api/stripe/webhook', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const { plan, restaurant_id } = session.metadata || {};

  if (!session.subscription) return;

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

  const stripeSubscription = (await stripe.subscriptions.retrieve(
    subscriptionId
  )) as unknown as SubscriptionData;

  if (restaurant_id && restaurant_id !== 'new') {
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;

    await supabase
      .from('subscriptions')
      .update({
        plan: plan as 'essential' | 'pro' | 'enterprise',
        status: 'active',
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: customerId,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        trial_end: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : null,
      })
      .eq('restaurant_id', restaurant_id);
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: SubscriptionData
) {
  const status = subscription.status;

  await supabase
    .from('subscriptions')
    .update({
      status: status as 'active' | 'past_due' | 'canceled' | 'trialing',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: SubscriptionData
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: { subscription?: string }
) {
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' as const })
      .eq('stripe_subscription_id', invoice.subscription);
  }
}
