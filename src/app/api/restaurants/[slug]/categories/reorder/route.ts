import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError } from '@/lib/api/validation';

/**
 * POST /api/restaurants/[slug]/categories/reorder
 *
 * Reorder categories
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update each category's sort_order
    for (const item of items) {
      await supabase.from('categories').update({ sort_order: item.sortOrder }).eq('id', item.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('POST /api/restaurants/[slug]/categories/reorder', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
