'use server';

import { createAdminClient } from '@/lib/supabase';
// import { logApiError } from '@/lib/api/validation';

interface CreateEssentialOrderParams {
  restaurantId: string;
  tableNumber: string; // Changed from tableId to tableNumber for easier UI integration
  amount: number; // In cents
  description?: string;
}

/**
 * Creates an order for the "Essential" plan (Manual Charge).
 *
 * Logic:
 * 1. Resolves Table ID from Number.
 * 2. Checks if a "Manual Charge" product exists for this restaurant.
 * 3. If not, creates one (hidden, unit price 0).
 * 4. Creates an Order.
 * 5. Creates an OrderItem with the dynamic amount.
 */
export async function createEssentialOrder({
  restaurantId,
  tableNumber,
  amount,
  description = 'Manual Charge',
}: CreateEssentialOrderParams) {
  const supabase = createAdminClient();

  try {
    // 0. Resolve Table ID
    let { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('number', tableNumber)
      .single();

    // Auto-create table if it doesn't exist?
    // For Essential plan, maybe we just want to ensure it works.
    if (!table) {
      const { data: newTable, error: tableError } = await supabase
        .from('tables')
        .insert({
          restaurant_id: restaurantId,
          number: tableNumber,
          status: 'available',
          capacity: 4, // default
        })
        .select('id')
        .single();

      if (tableError) throw new Error(`Failed to find or create table: ${tableError.message}`);
      table = newTable;
    }

    if (!table) throw new Error('Table resolution failed');
    const tableId = table.id;

    // 1. Find or Create "Manual Charge" Product
    // We look for a special product named "Manual Charge"
    let { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('name', 'Manual Charge')
      .single();

    if (!product) {
      // Create it
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          restaurant_id: restaurantId,
          name: 'Manual Charge',
          description: 'Used for manual payment entry',
          price_cents: 0, // Base price 0, overridden in order item
          is_available: false, // Hidden from menu
          sort_order: 9999,
        })
        .select('id')
        .single();

      if (productError) throw new Error(`Failed to create manual product: ${productError.message}`);
      product = newProduct;
    }

    if (!product) throw new Error('Could not get product ID');

    // 2. Clear valid open orders for this table (Basic logic: if exists, we might want to close or error?
    // For now, let's assume we just create a NEW order. Real world might need to handle existing open orders.
    // The `POST /api/orders` logic occupies the table. Let's replicate or reuse logic.
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        status: 'open',
        subtotal_cents: amount,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 4. Create Order Item
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      unit_price_cents: amount,
      notes: description,
      status: 'served', // Auto-serve manual items
    });

    if (itemError) throw itemError;

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('createEssentialOrder Error:', error);
    // Explicitly cast error to any to access message safely or generic string
    const msg = error instanceof Error ? error.message : 'Failed to create order';
    return { success: false, error: msg };
  }
}
