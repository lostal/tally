import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * PATCH /api/restaurants/[slug]/settings
 * Update restaurant settings
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, theme, logoUrl } = body;

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (theme) updateData.theme = theme;
    if (logoUrl !== undefined) updateData.logo_url = logoUrl;

    const { error } = await supabase.from('restaurants').update(updateData).eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
