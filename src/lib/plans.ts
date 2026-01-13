import { SubscriptionPlan, PRICING_PLANS } from '@/types/subscription';

/**
 * Get plan details by ID
 */
export function getPlan(planId: SubscriptionPlan) {
  return PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0]; // Default to first (Essential) if not found
}

/**
 * Check if the plan allows accessing the full POS (Tables, Orders)
 * Essential plan is Keypad ONLY.
 */
export function canAccessFullPOS(planId: SubscriptionPlan): boolean {
  return planId !== 'essential';
}

/**
 * Check if the plan allows KDS
 */
export function hasKDS(planId: SubscriptionPlan): boolean {
  const plan = getPlan(planId);
  return plan.limits.hasKds;
}

/**
 * Check if the plan allows Itemized splitting
 */
export function canSplitByItems(planId: SubscriptionPlan): boolean {
  return planId !== 'essential';
}
