import { createClient } from '@/lib/supabase/server';
import { POSTablesContent } from './tables-content';
import { KeypadPremium } from '@/components/pos/keypad-premium';
import { canAccessFullPOS } from '@/lib/plans';
import { SubscriptionPlan } from '@/types/subscription';

/**
 * POS Tables Overview Page
 * Acts as a dispatcher based on the Plan.
 */
export default async function POSTablesPage() {
  const supabase = await createClient();

  // Get restaurant (demo - first one)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, settings, slug')
    .limit(1)
    .single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  // Determine Plan
  // Safely cast settings to check for subscription_tier
  const settings = restaurant.settings as { subscription_tier?: SubscriptionPlan } | null;
  const plan = settings?.subscription_tier || 'essential'; // Default to essential if not set

  // If Essential, show Keypad ONLY.
  if (!canAccessFullPOS(plan)) {
    return (
      <div className="flex items-center justify-center py-10">
        <KeypadPremium restaurantId={restaurant.id} slug={restaurant.slug!} />
      </div>
    );
  }

  // --- PRO/ENTERPRISE Logic (Tables) ---

  // Get tables with active orders
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_active', true)
    .order('number', { ascending: true });

  // Get active orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, table_id, status, subtotal_cents, created_at')
    .eq('restaurant_id', restaurant.id)
    .in('status', ['open', 'served', 'paying']);

  return (
    <POSTablesContent restaurantId={restaurant.id} tables={tables || []} orders={orders || []} />
  );
}
