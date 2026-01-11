import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/restaurants/[slug]/tables
 * Create a new table
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { number, capacity } = body;

    if (!number) {
      return NextResponse.json({ error: 'Table number required' }, { status: 400 });
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

    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        restaurant_id: restaurant.id,
        number,
        capacity: capacity || 4,
        status: 'available',
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/restaurants/[slug]/tables
 * Update a table
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tableId, number, capacity, status } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (number !== undefined) updateData.number = number;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    await supabase.from('tables').update(updateData).eq('id', tableId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/restaurants/[slug]/tables?id=xxx
 * Delete a table
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const tableId = url.searchParams.get('id');

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('tables').delete().eq('id', tableId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
