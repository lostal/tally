import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * GET /api/kds/orders
 *
 * Get active orders for KDS display
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
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

    if (error) {
      console.error('KDS fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform data with proper type handling
    const transformedOrders = (orders || []).map((order) => {
      // Handle table relation
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

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('KDS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
