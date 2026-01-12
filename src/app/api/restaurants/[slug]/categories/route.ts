import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  sortOrder: z.number().int().min(0).optional(),
});

const UpdateCategorySchema = z.object({
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  name: z.string().min(1).max(100).optional(),
});

const DeleteCategorySchema = z.object({
  id: z.string().uuid('Category ID must be a valid UUID'),
});

/**
 * Verify user has admin access to restaurant
 */
async function verifyRestaurantAdmin(slug: string, userId: string) {
  const supabase = createAdminClient();

  // Get restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!restaurant) return { hasAccess: false, restaurantId: null };

  // Check if user belongs to this restaurant and has admin role
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
 * POST /api/restaurants/[slug]/categories
 * Create a new category. Requires owner/manager role.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // 1. Verify auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Verify admin access
    const { hasAccess, restaurantId } = await verifyRestaurantAdmin(slug, user.id);
    if (!hasAccess || !restaurantId) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 3. Validate body
    const body = await request.json();
    const validation = CreateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, sortOrder } = validation.data;
    const adminSupabase = createAdminClient();

    const { data: category, error } = await adminSupabase
      .from('categories')
      .insert({
        restaurant_id: restaurantId,
        name,
        sort_order: sortOrder || 0,
        is_active: true,
      })
      .select('id, name, sort_order')
      .single();

    if (error) {
      logApiError('POST /api/restaurants/[slug]/categories', error);
      return serverError('Failed to create category');
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/restaurants/[slug]/categories', error);
    return serverError();
  }
}

/**
 * PATCH /api/restaurants/[slug]/categories
 * Update a category. Requires owner/manager role.
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
    const validation = UpdateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryId, name } = validation.data;
    const adminSupabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;

    await adminSupabase.from('categories').update(updateData).eq('id', categoryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('PATCH /api/restaurants/[slug]/categories', error);
    return serverError();
  }
}

/**
 * DELETE /api/restaurants/[slug]/categories?id=xxx
 * Delete a category. Requires owner/manager role.
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
    const validation = DeleteCategorySchema.safeParse({ id: url.searchParams.get('id') });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid category ID', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from('categories').delete().eq('id', validation.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('DELETE /api/restaurants/[slug]/categories', error);
    return serverError();
  }
}
