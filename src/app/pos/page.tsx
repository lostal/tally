import { createClient } from '@/lib/supabase/server';
import { POSTablesContent } from './tables-content';

/**
 * POS Tables Overview Page
 */
export default async function POSTablesPage() {
  const supabase = await createClient();

  // Get restaurant (demo - first one)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .limit(1)
    .single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

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
