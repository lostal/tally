import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/api/validation';

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
  selectedPlan: z.enum(['starter', 'pro', 'business']).default('starter'),
});

/**
 * POST /api/onboarding/complete
 *
 * Creates a new restaurant with all associated data.
 */
export async function POST(request: NextRequest) {
  try {
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

    // 1. Create restaurant
    const { data: restaurant, error: restaurantError } = await supabase
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
    const { error: subscriptionError } = await supabase.from('subscriptions').insert({
      restaurant_id: restaurant.id,
      plan: data.selectedPlan,
      status: 'trialing',
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    });

    if (subscriptionError) {
      logApiError('POST /api/onboarding/complete', subscriptionError);
    }

    // 3. Create user record
    const { error: userError } = await supabase.from('users').insert({
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
      await supabase
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

    const { error: tablesError } = await supabase.from('tables').insert(tables);

    if (tablesError) {
      logApiError('POST /api/onboarding/complete', tablesError);
    }

    // 6. Create demo menu if selected
    if (data.menuOption === 'demo') {
      await createDemoMenu(supabase, restaurant.id);
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

async function createDemoMenu(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string
) {
  // Create demo categories
  const categories = [
    { name: 'Entrantes', sort_order: 1 },
    { name: 'Principales', sort_order: 2 },
    { name: 'Bebidas', sort_order: 3 },
    { name: 'Postres', sort_order: 4 },
  ];

  const { data: createdCategories } = await supabase
    .from('categories')
    .insert(categories.map((c) => ({ ...c, restaurant_id: restaurantId })))
    .select();

  if (!createdCategories) return;

  const categoryMap = Object.fromEntries(createdCategories.map((c) => [c.name, c.id]));

  // Create demo products
  const products = [
    { category: 'Entrantes', name: 'Patatas bravas', price_cents: 650, tax_rate: 10 },
    { category: 'Entrantes', name: 'Croquetas caseras', price_cents: 850, tax_rate: 10 },
    { category: 'Principales', name: 'Hamburguesa gourmet', price_cents: 1450, tax_rate: 10 },
    { category: 'Principales', name: 'Ensalada César', price_cents: 1150, tax_rate: 10 },
    { category: 'Bebidas', name: 'Cerveza', price_cents: 350, tax_rate: 10 },
    { category: 'Bebidas', name: 'Agua mineral', price_cents: 250, tax_rate: 10 },
    { category: 'Postres', name: 'Tarta de queso', price_cents: 550, tax_rate: 10 },
  ];

  await supabase.from('products').insert(
    products.map((p) => ({
      restaurant_id: restaurantId,
      category_id: categoryMap[p.category],
      name: p.name,
      price_cents: p.price_cents,
      tax_rate: p.tax_rate,
      is_active: true,
    }))
  );
}
