import { createClient } from '@/lib/supabase/server';
import { KDSContent } from './kds-content';
import { redirect } from 'next/navigation';

/**
 * KDS (Kitchen Display System) Page
 *
 * Real-time view of orders for kitchen staff.
 */
export default async function KDSPage() {
  const supabase = await createClient();

  // Get current user's restaurant
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/pos/login');
  }

  // Get restaurant from user
  const { data: userData } = await supabase
    .from('users')
    .select('restaurant_id')
    .eq('auth_id', user.id)
    .single();

  if (!userData?.restaurant_id) {
    redirect('/pos/login');
  }

  const restaurantId = userData.restaurant_id;

  // Get active orders with items
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      created_at,
      table:tables(number),
      items:order_items(
        id,
        quantity,
        status,
        product:products(name)
      )
    `
    )
    .eq('restaurant_id', restaurantId)
    .in('status', ['open', 'served'])
    .order('created_at', { ascending: true });

  // Transform data with proper type handling
  const transformedOrders = (orders || []).map((order) => {
    // Handle table relation (could be object or array)
    const tableData = order.table as { number: string } | { number: string }[] | null;
    const tableNumber = Array.isArray(tableData) ? tableData[0]?.number : tableData?.number;

    // Handle items relation
    const items =
      (order.items as Array<{
        id: string;
        quantity: number;
        status: string;
        product: { name: string } | { name: string }[] | null;
      }>) || [];

    return {
      id: order.id,
      tableNumber: tableNumber || '?',
      status: order.status,
      created_at: order.created_at,
      items: items.map((item) => {
        const productData = item.product;
        const productName = Array.isArray(productData) ? productData[0]?.name : productData?.name;

        return {
          id: item.id,
          productName: productName || 'Item',
          quantity: item.quantity,
          status: item.status,
        };
      }),
    };
  });

  return <KDSContent restaurantId={restaurantId} orders={transformedOrders} />;
}
