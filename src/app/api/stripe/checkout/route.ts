import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPlanById, type SubscriptionPlan } from '@/types';
import { logApiError } from '@/lib/api/validation';
import { getAppUrl } from '@/lib/url';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createCheckoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'business']),
  billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
  restaurantId: z.string().uuid().optional(), // For upgrades
});

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for new subscriptions or upgrades.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, billingPeriod, restaurantId } = createCheckoutSchema.parse(body);

    const pricingPlan = getPlanById(plan as SubscriptionPlan);
    if (!pricingPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId =
      billingPeriod === 'yearly' ? pricingPlan.stripeYearlyPriceId : pricingPlan.stripePriceId;

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Get or create Stripe customer
    let customerId: string | undefined;

    if (restaurantId) {
      // Existing restaurant upgrading
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('restaurant_id', restaurantId)
        .single();

      customerId = subscription?.stripe_customer_id || undefined;
    }

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          auth_id: user.id,
          restaurant_id: restaurantId || '',
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          plan,
          auth_id: user.id,
          restaurant_id: restaurantId || 'new',
        },
      },
      success_url: `${getAppUrl('hub')}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl('hub')}/pricing`,
      metadata: {
        plan,
        auth_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logApiError('POST /api/stripe/checkout', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
