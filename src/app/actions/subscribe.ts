'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { getAppUrl } from '@/lib/url';
import { createClient } from '@/lib/supabase/server';

export async function createCheckoutSession(priceId: string, restaurantId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get restaurant owner email for pre-filling
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('email, name') // Assuming email might be on restaurant or we use user email
    .eq('id', restaurantId)
    .single();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      restaurant_id: restaurantId,
    },
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${getAppUrl('hub')}/${restaurantId}?checkout=success`,
    cancel_url: `${getAppUrl('hub')}/${restaurantId}?checkout=canceled`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createPortalSession(restaurantId: string) {
  const supabase = await createClient();

  // Get subscription details to find stripe_customer_id
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('restaurant_id', restaurantId)
    .single();

  if (!subscription?.stripe_customer_id) {
    throw new Error('No subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${getAppUrl('hub')}/${restaurantId}`,
  });

  if (session.url) {
    redirect(session.url);
  }
}
