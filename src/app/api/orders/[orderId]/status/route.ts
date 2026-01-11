import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * PATCH /api/orders/[orderId]/status
 *
 * Update order status
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    await supabase.from('orders').update({ status }).eq('id', orderId);

    // If status is 'closed' or 'cancelled', make table available again
    if (status === 'closed' || status === 'cancelled') {
      const { data: order } = await supabase
        .from('orders')
        .select('table_id')
        .eq('id', orderId)
        .single();

      if (order?.table_id) {
        await supabase.from('tables').update({ status: 'available' }).eq('id', order.table_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
