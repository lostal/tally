import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * POST /api/orders
 *
 * Create a new order for a table
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, tableId } = body;

    if (!restaurantId || !tableId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update table status to occupied
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);

    // Create new order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        status: 'open',
        subtotal_cents: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
