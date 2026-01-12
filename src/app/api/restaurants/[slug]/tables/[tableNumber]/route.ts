import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ slug: string; tableNumber: string }>;
}

/**
 * GET /api/restaurants/[slug]/tables/[tableNumber]
 *
 * Get table info and active order
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const tableNumber = resolvedParams.tableNumber;
    const supabase = createAdminClient();

    // Get restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id, name, slug, logo_url, theme')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Get table
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id, number, capacity, status')
      .eq('restaurant_id', restaurant.id)
      .eq('number', tableNumber)
      .eq('is_active', true)
      .single();

    if (tableError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Get active order for this table (if any)
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, status, subtotal_cents, discount_cents, notes, created_at')
      .eq('table_id', table.id)
      .in('status', ['open', 'served', 'paying'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (orderError) {
      logApiError('GET /api/restaurants/[slug]/tables/[tableNumber]', orderError);
    }

    const order = orders?.[0] || null;
    let orderItems: Array<{
      id: string;
      product_id: string;
      quantity: number;
      unit_price_cents: number;
      notes: string | null;
      status: string;
    }> = [];
    let products: Array<{
      id: string;
      name: string;
      description: string | null;
      image_url: string | null;
    }> = [];

    if (order) {
      // Get order items
      const { data: items } = await supabase
        .from('order_items')
        .select('id, product_id, quantity, unit_price_cents, notes, status')
        .eq('order_id', order.id);

      orderItems = items || [];

      // Get products for these items
      if (orderItems.length > 0) {
        const productIds = orderItems.map((i) => i.product_id);
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, description, image_url')
          .in('id', productIds);

        products = prods || [];
      }
    }

    // Calculate order total from items
    const orderTotal = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_cents,
      0
    );

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logo_url,
        theme: restaurant.theme,
      },
      table: {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      },
      order: order
        ? {
            id: order.id,
            status: order.status,
            subtotalCents: orderTotal,
            discountCents: order.discount_cents,
            totalCents: orderTotal - (order.discount_cents || 0),
            items: orderItems.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              return {
                id: item.id,
                productId: item.product_id,
                name: product?.name || 'Unknown',
                description: product?.description,
                imageUrl: product?.image_url,
                quantity: item.quantity,
                unitPriceCents: item.unit_price_cents,
                totalCents: item.quantity * item.unit_price_cents,
                notes: item.notes,
                status: item.status,
              };
            }),
            createdAt: order.created_at,
          }
        : null,
    });
  } catch (error) {
    logApiError('GET /api/restaurants/[slug]/tables/[tableNumber]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
