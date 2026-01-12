import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';

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
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

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

    if (!order) {
      return NextResponse.json({ error: 'Order not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Check if user belongs to this restaurant
    const { data: userData } = await adminSupabase
      .from('users')
      .select('restaurant_id')
      .eq('auth_id', user.id)
      .single();

    if (!userData || userData.restaurant_id !== order.restaurant_id) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
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
