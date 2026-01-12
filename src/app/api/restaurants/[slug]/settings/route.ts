import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError } from '@/lib/api/validation';

const UpdateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  theme: z
    .object({
      family: z.string(),
      accentFamily: z.string().optional(),
      hueOffset: z.number().min(-15).max(15).optional(),
      mode: z.enum(['auto', 'light', 'dark']).optional(),
      radiusScale: z.enum(['sm', 'md', 'lg']).optional(),
    })
    .optional(),
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

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
 * PATCH /api/restaurants/[slug]/settings
 *
 * Update restaurant settings (name, theme).
 * Requires owner/manager role.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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
    const { hasAccess } = await verifyRestaurantAdmin(slug, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { data, error: validationError } = await validateBody(request, UpdateSettingsSchema);
    if (validationError) {
      return validationError;
    }

    const adminSupabase = createAdminClient();

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.theme) {
      updateData.theme = data.theme;
    }

    // Update restaurant
    const { data: restaurant, error: updateError } = await adminSupabase
      .from('restaurants')
      .update(updateData)
      .eq('slug', slug)
      .select('id, name, slug, theme')
      .single();

    if (updateError) {
      logApiError('PATCH /api/restaurants/[slug]/settings', updateError);
      return serverError('Failed to update settings');
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    logApiError('PATCH /api/restaurants/[slug]/settings', error);
    return serverError();
  }
}
