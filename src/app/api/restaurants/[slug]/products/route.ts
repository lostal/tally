import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError, serverError } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const CreateProductSchema = z.object({
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  priceCents: z.number().int().min(0, 'Price cannot be negative'),
  sortOrder: z.number().int().min(0).optional(),
});

const UpdateProductSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  priceCents: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

const DeleteProductSchema = z.object({
  id: z.string().uuid('Product ID must be a valid UUID'),
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
 * POST /api/restaurants/[slug]/products
 * Create a new product. Requires owner/manager role.
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
    const validation = CreateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryId, name, description, priceCents, sortOrder } = validation.data;
    const adminSupabase = createAdminClient();

    const { data: product, error } = await adminSupabase
      .from('products')
      .insert({
        restaurant_id: restaurantId,
        category_id: categoryId || null,
        name,
        description: description || null,
        price_cents: priceCents,
        sort_order: sortOrder || 0,
        is_available: true,
      })
      .select('id, name, price_cents')
      .single();

    if (error) {
      logApiError('POST /api/restaurants/[slug]/products', error);
      return serverError('Failed to create product');
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/restaurants/[slug]/products', error);
    return serverError();
  }
}

/**
 * PATCH /api/restaurants/[slug]/products
 * Update a product. Requires owner/manager role.
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
    const validation = UpdateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, name, description, priceCents, isAvailable } = validation.data;
    const adminSupabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priceCents !== undefined) updateData.price_cents = priceCents;
    if (isAvailable !== undefined) updateData.is_available = isAvailable;

    await adminSupabase.from('products').update(updateData).eq('id', productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('PATCH /api/restaurants/[slug]/products', error);
    return serverError();
  }
}

/**
 * DELETE /api/restaurants/[slug]/products?id=xxx
 * Delete a product. Requires owner/manager role.
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
    const validation = DeleteProductSchema.safeParse({ id: url.searchParams.get('id') });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product ID', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from('products').delete().eq('id', validation.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('DELETE /api/restaurants/[slug]/products', error);
    return serverError();
  }
}
