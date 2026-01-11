import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * POST /api/restaurants/[slug]/products/reorder
 *
 * Reorder products within a category
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update each product's sort_order
    for (const item of items) {
      await supabase.from('products').update({ sort_order: item.sortOrder }).eq('id', item.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
