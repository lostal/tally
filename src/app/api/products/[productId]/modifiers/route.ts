import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyApiAuth } from '@/lib/supabase/middleware';
import { unauthorized } from '@/lib/api/validation';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/**
 * GET /api/products/[productId]/modifiers
 *
 * Get all modifiers for a product.
 * Used in POS to display modifier options when adding items to orders.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;

  // Verify authentication
  const { user, error: _error } = await verifyApiAuth(request);
  if (!user) return unauthorized();

  const adminSupabase = createAdminClient();

  // Get modifiers for this product
  const { data: modifiers, error: modifiersError } = await adminSupabase
    .from('product_modifiers')
    .select('id, name, price_cents, is_required')
    .eq('product_id', productId)
    .order('name');

  if (modifiersError) {
    return NextResponse.json({ error: 'Failed to fetch modifiers' }, { status: 500 });
  }

  return NextResponse.json({ modifiers: modifiers || [] });
}
