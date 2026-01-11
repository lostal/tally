import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/restaurants/[slug]/products
 * Create a new product
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { categoryId, name, description, priceCents, sortOrder } = body;

    if (!name || priceCents === undefined) {
      return NextResponse.json({ error: 'Name and price required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        restaurant_id: restaurant.id,
        category_id: categoryId,
        name,
        description: description || null,
        price_cents: priceCents,
        sort_order: sortOrder || 0,
        is_available: true,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/restaurants/[slug]/products
 * Update a product
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { productId, name, description, priceCents, isAvailable } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priceCents !== undefined) updateData.price_cents = priceCents;
    if (isAvailable !== undefined) updateData.is_available = isAvailable;

    await supabase.from('products').update(updateData).eq('id', productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/restaurants/[slug]/products?id=xxx
 * Delete a product
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('products').delete().eq('id', productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
