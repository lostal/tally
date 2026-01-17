import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/api/validation';
import { TRIAL_PERIOD_MS } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';

const completeSchema = z.object({
  userId: z.string().uuid(),
  // Business
  restaurantName: z.string().min(1),
  slug: z.string().min(1),
  taxId: z.string().optional(),
  address: z.string().optional(),
  // Branding
  primaryColor: z.string().default('#000000'),
  accentColor: z.string().default('#22c55e'),
  logoUrl: z.string().optional(),
  // Menu
  menuOption: z.enum(['empty', 'demo', 'import']).default('demo'),
  // Tables
  tableCount: z.number().min(1).max(50).default(5),
  tableCapacity: z.number().min(1).max(20).default(4),
  // Plan
  selectedPlan: z.enum(['essential', 'pro', 'enterprise']).default('essential'),
});

/**
 * POST /api/onboarding/complete
 *
 * Creates a new restaurant with all associated data.
 * Uses admin client to bypass RLS for initial setup.
 */
export async function POST(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = completeSchema.parse(body);

    // Verify user owns this request
    if (data.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient();

    // 1. Create restaurant
    const { data: restaurant, error: restaurantError } = await adminClient
      .from('restaurants')
      .insert({
        name: data.restaurantName,
        slug: data.slug,
        logo_url: data.logoUrl || null,
        theme: {
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
        },
        owner_auth_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (restaurantError) {
      logApiError('POST /api/onboarding/complete', restaurantError);
      return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
    }

    // 2. Create subscription (trial)
    const { error: subscriptionError } = await adminClient.from('subscriptions').insert({
      restaurant_id: restaurant.id,
      plan: data.selectedPlan,
      status: 'trialing',
      trial_end: new Date(Date.now() + TRIAL_PERIOD_MS).toISOString(),
    });

    if (subscriptionError) {
      logApiError('POST /api/onboarding/complete', subscriptionError);
    }

    // 3. Create user record
    const { error: userError } = await adminClient.from('users').insert({
      restaurant_id: restaurant.id,
      auth_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || 'Owner',
      role: 'owner',
      is_active: true,
    });

    if (userError) {
      logApiError('POST /api/onboarding/complete', userError);
    }

    // 4. Add fiscal info if provided
    if (data.taxId || data.address) {
      await adminClient
        .from('restaurants')
        .update({
          tax_id: data.taxId,
          fiscal_address: data.address,
        })
        .eq('id', restaurant.id);
    }

    // 5. Create tables
    const tables = Array.from({ length: data.tableCount }, (_, i) => ({
      restaurant_id: restaurant.id,
      number: String(i + 1),
      capacity: data.tableCapacity,
      status: 'available',
      is_active: true,
    }));

    const { error: tablesError } = await adminClient.from('tables').insert(tables);

    if (tablesError) {
      logApiError('POST /api/onboarding/complete', tablesError);
    }

    // 6. Create demo menu if selected
    if (data.menuOption === 'demo') {
      await createDemoMenu(adminClient, restaurant.id);
    }

    return NextResponse.json({
      success: true,
      restaurantId: restaurant.id,
      slug: restaurant.slug,
    });
  } catch (error) {
    logApiError('POST /api/onboarding/complete', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createDemoMenu(supabase: SupabaseClient<any>, restaurantId: string) {
  // Create demo categories
  const categories: Array<{ name: string; sort_order: number }> = [
    { name: 'Entrantes', sort_order: 1 },
    { name: 'Principales', sort_order: 2 },
    { name: 'Bebidas', sort_order: 3 },
    { name: 'Postres', sort_order: 4 },
  ];

  const { data: createdCategories } = await supabase
    .from('categories')
    .insert(
      categories.map((c) => ({
        restaurant_id: restaurantId,
        name: c.name,
        sort_order: c.sort_order,
      }))
    )
    .select();

  if (!createdCategories) return;

  const categoryMap = Object.fromEntries(createdCategories.map((c) => [c.name, c.id]));

  // Create demo products
  const products = [
    { category: 'Entrantes', name: 'Patatas bravas', price_cents: 650 },
    { category: 'Entrantes', name: 'Croquetas caseras', price_cents: 850 },
    { category: 'Principales', name: 'Hamburguesa gourmet', price_cents: 1450 },
    { category: 'Principales', name: 'Ensalada César', price_cents: 1150 },
    { category: 'Bebidas', name: 'Cerveza', price_cents: 350 },
    { category: 'Bebidas', name: 'Agua mineral', price_cents: 250 },
    { category: 'Postres', name: 'Tarta de queso', price_cents: 550 },
  ];

  await supabase.from('products').insert(
    products.map((p) => ({
      restaurant_id: restaurantId,
      category_id: categoryMap[p.category],
      name: p.name,
      price_cents: p.price_cents,
      is_available: true,
    }))
  );
}
