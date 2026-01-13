/**
 * Subscription Types
 *
 * Types for SaaS subscription management and Stripe integration.
 */

export type SubscriptionPlan = 'essential' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export interface Subscription {
  id: string;
  restaurantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Stripe
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;

  // Dates
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  canceledAt: string | null;

  // Limits
  maxTables: number;
  maxUsers: number;
  hasKds: boolean;
  commissionRate: number;

  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  priceMonthly: number; // in cents
  priceYearly: number; // in cents (with discount)
  features: string[];
  limits: {
    tables: number;
    users: number;
    hasKds: boolean;
  };
  commissionRate: number;
  stripePriceId: string; // Monthly price ID
  stripeYearlyPriceId: string; // Yearly price ID
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    priceMonthly: 4900, // €49
    priceYearly: 47000, // €470 (2 months free)
    features: ['Pagos con QR', 'Propinas Digitales', 'División equitativa', 'Soporte Básico'],
    limits: { tables: 0, users: 1, hasKds: false }, // Essential is Keypad only
    commissionRate: 1.9,
    stripePriceId: process.env.STRIPE_ESSENTIAL_MONTHLY_PRICE_ID || '',
    stripeYearlyPriceId: process.env.STRIPE_ESSENTIAL_YEARLY_PRICE_ID || '',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 8900, // €89
    priceYearly: 85000, // €850 (2 months free)
    features: [
      'Hasta 15 mesas',
      '5 usuarios',
      'Pantalla de cocina (KDS)',
      'Tickets fiscales',
      'Soporte prioritario',
      'División por ítems',
    ],
    limits: { tables: 15, users: 5, hasKds: true },
    commissionRate: 1.5,
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 14900, // €149
    priceYearly: 143000, // €1430 (2 months free)
    features: [
      'Mesas ilimitadas',
      'Usuarios ilimitados',
      'Integración ERP',
      'API acceso',
      'Soporte dedicado 24/7',
    ],
    limits: { tables: 999, users: 999, hasKds: true },
    commissionRate: 1.2,
    stripePriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    stripeYearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
  },
];

export function getPlanById(planId: SubscriptionPlan): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  if (subscription.status === 'active') return true;

  if (subscription.status === 'trialing' && subscription.trialEnd) {
    return new Date(subscription.trialEnd) > new Date();
  }

  return false;
}
