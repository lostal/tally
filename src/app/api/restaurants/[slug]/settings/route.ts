import { NextResponse } from 'next/server';
import { z } from 'zod';
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
 * PATCH /api/restaurants/[slug]/settings
 *
 * Update restaurant settings (name, theme).
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const { data, error: validationError } = await validateBody(request, UpdateSettingsSchema);
    if (validationError) {
      return validationError;
    }

    const supabase = createAdminClient();

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
    const { data: restaurant, error: updateError } = await supabase
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
