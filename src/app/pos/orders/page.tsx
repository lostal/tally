import { createClient } from '@/lib/supabase/server';
import { OrdersListContent } from './orders-list-content';

/**
 * POS Orders List Page
 */
export default async function OrdersListPage() {
  const supabase = await createClient();

  // Get restaurant
  const { data: restaurant } = await supabase.from('restaurants').select('id').limit(1).single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  // Get active orders with table info
  const { data: orders } = await supabase
    .from('orders')
    .select('*, tables(number)')
    .eq('restaurant_id', restaurant.id)
    .in('status', ['open', 'served', 'paying'])
    .order('created_at', { ascending: false });

  return <OrdersListContent orders={orders || []} />;
}
