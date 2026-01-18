import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';

/**
 * GET /api/kds/orders
 *
 * Get active orders for KDS display.
 * Requires authenticated user with access to the restaurant.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication and permissions
    const { restaurantId, error: authError } = await verifyApiAuthWithRole(request, 'orders:read');
    if (authError) return authError;

    // 2. Fetch orders using admin client for full access
    const adminSupabase = createAdminClient();
    const { data: orders, error } = await adminSupabase
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
      .eq('restaurant_id', restaurantId!)
      .in('status', ['open', 'served'])
      .order('created_at', { ascending: true });

    if (error) {
      logApiError('GET /api/kds/orders', error);
      return serverError('Failed to fetch orders');
    }

    // 5. Transform data with proper type handling
    const transformedOrders = (orders || []).map((order) => {
      const tableData = order.table as { number: string } | { number: string }[] | null;
      const tableNumber = Array.isArray(tableData) ? tableData[0]?.number : tableData?.number;

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
    logApiError('GET /api/kds/orders', error);
    return serverError();
  }
}
