import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/restaurants/[slug]/categories
 * Create a new category
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get restaurant
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        restaurant_id: restaurant.id,
        name,
        sort_order: sortOrder || 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/restaurants/[slug]/categories?id=xxx
 * Delete a category
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('categories').delete().eq('id', categoryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/restaurants/[slug]/categories
 * Update a category
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, name } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;

    await supabase.from('categories').update(updateData).eq('id', categoryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
