import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

const ModifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceCents: z.number().int(),
});

const AddItemSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPriceCents: z.number().int().min(0, 'Price cannot be negative'),
  modifiers: z.array(ModifierSchema).optional(),
  notes: z.string().optional(),
});

const UpdateItemSchema = z.object({
  itemId: z.string().uuid('Item ID must be a valid UUID'),
  quantity: z.number().int().min(0).optional(),
  status: z.enum(['pending', 'preparing', 'ready', 'delivered']).optional(),
});

/**
 * POST /api/orders/[orderId]/items
 *
 * Add item to order. Requires authenticated staff member.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    // 1. Verify authentication and permissions
    const { restaurantId, error: authError } = await verifyApiAuthWithRole(
      request,
      'orders:create'
    );
    if (authError) return authError;

    // 2. Validate body
    const body = await request.json();
    const validation = AddItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity, unitPriceCents, modifiers, notes } = validation.data;
    const adminSupabase = createAdminClient();

    // 3. Verify order belongs to user's restaurant
    const { data: order } = await adminSupabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', orderId)
      .single();

    if (!order || order.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: 'Order not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // 4. Check if item already exists
    const { data: existing } = await adminSupabase
      .from('order_items')
      .select('id, quantity')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update quantity
      await adminSupabase
        .from('order_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      // Create new item
      await adminSupabase.from('order_items').insert({
        order_id: orderId,
        product_id: productId,
        quantity,
        unit_price_cents: unitPriceCents,
        modifiers: modifiers || [],
        notes: notes || null,
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('POST /api/orders/[orderId]/items', error);
    return serverError();
  }
}

/**
 * PATCH /api/orders/[orderId]/items
 *
 * Update item quantity or status. Requires authenticated staff member.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    // 1. Verify authentication and permissions
    const { restaurantId, error: authError } = await verifyApiAuthWithRole(
      request,
      'orders:create'
    );
    if (authError) return authError;

    // 2. Verify order belongs to user's restaurant
    const adminSupabase = createAdminClient();
    const { data: order } = await adminSupabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', orderId)
      .single();

    if (!order || order.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: 'Order not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // 3. Validate body
    const body = await request.json();
    const validation = UpdateItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { itemId, quantity, status } = validation.data;

    // 4. Update item
    if (quantity !== undefined) {
      if (quantity <= 0) {
        await adminSupabase.from('order_items').delete().eq('id', itemId);
      } else {
        await adminSupabase.from('order_items').update({ quantity }).eq('id', itemId);
      }
    }

    if (status) {
      await adminSupabase.from('order_items').update({ status }).eq('id', itemId);
    }

    // 5. Recalculate order total
    const { data: items } = await adminSupabase
      .from('order_items')
      .select('quantity, unit_price_cents')
      .eq('order_id', orderId);

    const subtotal =
      items?.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0) || 0;

    await adminSupabase.from('orders').update({ subtotal_cents: subtotal }).eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('PATCH /api/orders/[orderId]/items', error);
    return serverError();
  }
}
