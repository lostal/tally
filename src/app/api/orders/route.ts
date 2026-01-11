import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, unauthorized, serverError, logApiError } from '@/lib/api/validation';

/**
 * Zod schema for order creation
 */
const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid('Restaurant ID must be a valid UUID'),
  tableId: z.string().uuid('Table ID must be a valid UUID'),
});

/**
 * POST /api/orders
 *
 * Create a new order for a table.
 * Requires valid restaurantId and tableId.
 */
export async function POST(request: Request) {
  try {
    // Validate request body
    const { data, error: validationError } = await validateBody(request, CreateOrderSchema);
    if (validationError) {
      return validationError;
    }

    const { restaurantId, tableId } = data;
    const supabase = createAdminClient();

    // Verify restaurant exists and is active
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, is_active')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!restaurant.is_active) {
      return NextResponse.json(
        { error: 'Restaurant is not active', code: 'INACTIVE' },
        { status: 400 }
      );
    }

    // Verify table exists and belongs to restaurant
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id, status, is_active')
      .eq('id', tableId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (tableError || !table) {
      return NextResponse.json({ error: 'Table not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    if (!table.is_active) {
      return NextResponse.json({ error: 'Table is not active', code: 'INACTIVE' }, { status: 400 });
    }

    // Update table status to occupied
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);

    // Create new order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        status: 'open',
        subtotal_cents: 0,
      })
      .select('id')
      .single();

    if (orderError) {
      logApiError('POST /api/orders', orderError);
      return serverError('Failed to create order');
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/orders', error);
    return serverError();
  }
}
