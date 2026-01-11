import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/restaurants/[slug]/menu
 *
 * Get restaurant menu with categories and products
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const supabase = createAdminClient();

    // First get restaurant ID
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description, sort_order')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (catError) {
      console.error('Error fetching categories:', catError);
      return NextResponse.json({ error: 'Error fetching menu' }, { status: 500 });
    }

    // Get products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select(
        'id, category_id, name, description, price_cents, image_url, is_available, sort_order'
      )
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (prodError) {
      console.error('Error fetching products:', prodError);
      return NextResponse.json({ error: 'Error fetching menu' }, { status: 500 });
    }

    // Combine categories with their products
    const menu = categories?.map((category) => ({
      ...category,
      products: products?.filter((p) => p.category_id === category.id) || [],
    }));

    return NextResponse.json({ categories: menu });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
