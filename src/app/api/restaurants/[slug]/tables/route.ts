import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const CreateTableSchema = z.object({
  number: z.string().min(1, 'Table number is required'),
  capacity: z.number().int().min(1).optional(),
});

const UpdateTableSchema = z.object({
  tableId: z.string().uuid('Table ID must be a valid UUID'),
  number: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(['available', 'occupied', 'payment_pending']).optional(),
});

const DeleteTableSchema = z.object({
  id: z.string().uuid('Table ID must be a valid UUID'),
});

/**
 * Verify user has admin access to restaurant
 */
async function verifyRestaurantAdmin(slug: string, userId: string) {
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!restaurant) return { hasAccess: false, restaurantId: null };

  const { data: userData } = await supabase
    .from('users')
    .select('restaurant_id, role')
    .eq('auth_id', userId)
    .single();

  if (!userData) return { hasAccess: false, restaurantId: null };

  const hasAccess =
    userData.restaurant_id === restaurant.id &&
    (userData.role === 'owner' || userData.role === 'manager');

  return { hasAccess, restaurantId: restaurant.id };
}

/**
 * POST /api/restaurants/[slug]/tables
 * Create a new table. Requires owner/manager role.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { hasAccess, restaurantId } = await verifyRestaurantAdmin(slug, user.id);
    if (!hasAccess || !restaurantId) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateTableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { number, capacity } = validation.data;
    const adminSupabase = createAdminClient();

    const { data: table, error } = await adminSupabase
      .from('tables')
      .insert({
        restaurant_id: restaurantId,
        number,
        capacity: capacity || 4,
        status: 'available',
        is_active: true,
      })
      .select('id, number, status')
      .single();

    if (error) {
      logApiError('POST /api/restaurants/[slug]/tables', error);
      return serverError('Failed to create table');
    }

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/restaurants/[slug]/tables', error);
    return serverError();
  }
}

/**
 * PATCH /api/restaurants/[slug]/tables
 * Update a table. Requires owner/manager role.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { hasAccess } = await verifyRestaurantAdmin(slug, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const validation = UpdateTableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tableId, number, capacity, status } = validation.data;
    const adminSupabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (number !== undefined) updateData.number = number;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    await adminSupabase.from('tables').update(updateData).eq('id', tableId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('PATCH /api/restaurants/[slug]/tables', error);
    return serverError();
  }
}

/**
 * DELETE /api/restaurants/[slug]/tables?id=xxx
 * Delete a table. Requires owner/manager role.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { hasAccess } = await verifyRestaurantAdmin(slug, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    const url = new URL(request.url);
    const validation = DeleteTableSchema.safeParse({ id: url.searchParams.get('id') });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid table ID', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from('tables').delete().eq('id', validation.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('DELETE /api/restaurants/[slug]/tables', error);
    return serverError();
  }
}
