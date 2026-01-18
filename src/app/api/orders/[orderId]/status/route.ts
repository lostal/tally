import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

const UpdateStatusSchema = z.object({
  status: z.enum(['open', 'served', 'closed', 'cancelled']),
});

/**
 * PATCH /api/orders/[orderId]/status
 *
 * Update order status. Requires authenticated staff member.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    // 1. Verify authentication and permissions
    const { restaurantId, error: authError } = await verifyApiAuthWithRole(request, 'orders:read');
    if (authError) return authError;

    // 2. Validate body
    const body = await request.json();
    const validation = UpdateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = validation.data;
    const adminSupabase = createAdminClient();

    // 3. Get order and verify access
    const { data: order } = await adminSupabase
      .from('orders')
      .select('restaurant_id, table_id')
      .eq('id', orderId)
      .single();

    if (!order || order.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: 'Order not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // 4. Update order status
    await adminSupabase.from('orders').update({ status }).eq('id', orderId);

    // 5. If order is closed/cancelled, free up the table
    if (status === 'closed' || status === 'cancelled') {
      if (order.table_id) {
        await adminSupabase.from('tables').update({ status: 'available' }).eq('id', order.table_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('PATCH /api/orders/[orderId]/status', error);
    return serverError();
  }
}
