import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/api/validation';
import { buildUrl } from '@/lib/url';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for customers to manage their subscription.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's restaurant
    const { data: userData } = await supabase
      .from('users')
      .select('restaurant_id')
      .eq('auth_id', user.id)
      .single();

    if (!userData?.restaurant_id) {
      return NextResponse.json({ error: 'No restaurant found' }, { status: 404 });
    }

    // Get subscription with Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('restaurant_id', userData.restaurant_id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: buildUrl('/hub/admin/settings'),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logApiError('POST /api/stripe/portal', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
