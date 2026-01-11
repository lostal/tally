import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * POST /api/orders/[orderId]/items
 *
 * Add item to order
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { productId, quantity, unitPriceCents } = body;

    if (!productId || !quantity || !unitPriceCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if item already exists
    const { data: existing } = await supabase
      .from('order_items')
      .select('id, quantity')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update quantity
      await supabase
        .from('order_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      // Create new item
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: productId,
        quantity,
        unit_price_cents: unitPriceCents,
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/[orderId]/items
 *
 * Update item quantity
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { itemId, quantity, status } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (quantity !== undefined) {
      if (quantity <= 0) {
        await supabase.from('order_items').delete().eq('id', itemId);
      } else {
        await supabase.from('order_items').update({ quantity }).eq('id', itemId);
      }
    }

    if (status) {
      await supabase.from('order_items').update({ status }).eq('id', itemId);
    }

    // Recalculate order total
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, unit_price_cents')
      .eq('order_id', orderId);

    const subtotal =
      items?.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0) || 0;

    await supabase.from('orders').update({ subtotal_cents: subtotal }).eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
