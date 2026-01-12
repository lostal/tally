import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { logApiError } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/restaurants/[slug]
 *
 * Get public restaurant information by slug
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const supabase = createAdminClient();

    // Get restaurant with basic info
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, slug, logo_url, theme, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    logApiError('GET /api/restaurants/[slug]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
