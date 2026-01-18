/**
 * E2E Global Setup
 *
 * Seeds test database with necessary data before running tests.
 * Creates a test restaurant, tables, products, and initial orders.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Test data to be used across all E2E tests
export const TEST_DATA = {
  restaurant: {
    slug: 'test-restaurant',
    name: 'Test Restaurant',
  },
  tables: ['1', '2', '3'],
  products: [
    { name: 'Cerveza', price_cents: 350, category: 'Bebidas' },
    { name: 'Hamburguesa', price_cents: 1200, category: 'Platos' },
    { name: 'Ensalada', price_cents: 850, category: 'Platos' },
  ],
};

async function globalSetup() {
  console.log('🌱 Seeding test database...');

  // Use service role client (bypasses all RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  // Service role client bypasses RLS
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Fixed test owner UUID (no authentication needed with service role)
    const testOwnerUuid = '00000000-0000-0000-0000-000000000001';

    // 1. Clean up existing test data
    console.log('  Cleaning up existing test data...');
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', TEST_DATA.restaurant.slug)
      .maybeSingle();

    if (existingRestaurant) {
      // 1. Manually delete orders first to clear order_items (which restrict product deletion)
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('restaurant_id', existingRestaurant.id);

      if (ordersError) {
        console.log('  ⚠️ Warning: Could not delete restaurant orders:', ordersError.message);
      }

      // 2. Delete restaurant (cascades to tables, products, etc.)
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', existingRestaurant.id);

      if (deleteError) {
        console.log('  ⚠️ Warning: Could not delete existing restaurant:', deleteError.message);
      } else {
        console.log('  ✓ Cleaned up existing test restaurant');
      }
    }

    // 2. Create test restaurant
    console.log('  Creating test restaurant...');
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: TEST_DATA.restaurant.name,
        slug: TEST_DATA.restaurant.slug,
        owner_auth_id: testOwnerUuid, // Required by RLS policy
        is_active: true,
        settings: {
          subscription_tier: 'pro', // Use Pro plan for full features
        },
      })
      .select('id')
      .single();

    if (restaurantError || !restaurant) {
      throw new Error(`Failed to create restaurant: ${restaurantError?.message}`);
    }

    console.log(`  ✓ Restaurant created: ${restaurant.id}`);

    // 3. Create tables
    console.log('  Creating tables...');
    const tablesData = TEST_DATA.tables.map((number) => ({
      restaurant_id: restaurant.id,
      number,
      capacity: 4,
      status: 'available' as const,
      is_active: true,
    }));

    const { error: tablesError } = await supabase.from('tables').insert(tablesData);

    if (tablesError) {
      throw new Error(`Failed to create tables: ${tablesError.message}`);
    }

    console.log(`  ✓ Created ${TEST_DATA.tables.length} tables`);

    // 4. Create categories
    console.log('  Creating categories...');
    const categories = ['Bebidas', 'Platos'];
    const categoriesData = categories.map((name, index) => ({
      restaurant_id: restaurant.id,
      name,
      description: `Categoría ${name}`,
      sort_order: index,
      is_active: true,
    }));

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesData)
      .select('id, name');

    if (categoriesError || !createdCategories) {
      throw new Error(`Failed to create categories: ${categoriesError?.message}`);
    }

    console.log(`  ✓ Created ${categories.length} categories`);

    // 5. Create products
    console.log('  Creating products...');
    const productsData = TEST_DATA.products.map((product) => {
      const category = createdCategories.find((c) => c.name === product.category);
      return {
        restaurant_id: restaurant.id,
        category_id: category?.id,
        name: product.name,
        description: `Test ${product.name}`,
        price_cents: product.price_cents,
        is_available: true,
        sort_order: 0,
      };
    });

    const { error: productsError } = await supabase.from('products').insert(productsData);

    if (productsError) {
      throw new Error(`Failed to create products: ${productsError.message}`);
    }

    console.log(`  ✓ Created ${TEST_DATA.products.length} products`);

    // 6. Create a test order with items (for bill page tests)
    console.log('  Creating test order...');
    const { data: table1 } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurant.id)
      .eq('number', '1')
      .single();

    if (table1) {
      const { data: testOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          table_id: table1.id,
          status: 'open',
          subtotal_cents: 2400, // 2 cervezas + 1 hamburguesa + 1 ensalada
        })
        .select('id')
        .single();

      if (orderError || !testOrder) {
        throw new Error(`Failed to create test order: ${orderError?.message}`);
      }

      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price_cents')
        .eq('restaurant_id', restaurant.id);

      if (products && products.length > 0) {
        const cervezaId = products.find((p) => p.name === 'Cerveza')?.id;
        const hamburguesaId = products.find((p) => p.name === 'Hamburguesa')?.id;
        const ensaladaId = products.find((p) => p.name === 'Ensalada')?.id;

        if (!cervezaId || !hamburguesaId || !ensaladaId) {
          throw new Error('Failed to find all products for test order');
        }

        const orderItems = [
          {
            order_id: testOrder.id,
            product_id: cervezaId,
            quantity: 2,
            unit_price_cents: 350,
            status: 'served' as const,
          },
          {
            order_id: testOrder.id,
            product_id: hamburguesaId,
            quantity: 1,
            unit_price_cents: 1200,
            status: 'served' as const,
          },
          {
            order_id: testOrder.id,
            product_id: ensaladaId,
            quantity: 1,
            unit_price_cents: 850,
            status: 'served' as const,
          },
        ];

        await supabase.from('order_items').insert(orderItems);

        // Create session for this order
        const { data: session } = await supabase
          .from('sessions')
          .insert({
            restaurant_id: restaurant.id,
            table_id: table1.id,
            status: 'active',
          })
          .select('id')
          .single();

        if (session) {
          // Create a participant
          await supabase.from('participants').insert({
            session_id: session.id,
            name: 'Test User',
            is_host: true,
            is_active: true,
          });
        }

        console.log(`  ✓ Created test order with ${orderItems.length} items`);
      }
    }

    console.log('✅ Test database seeded successfully!');
    console.log(`   Restaurant slug: ${TEST_DATA.restaurant.slug}`);
    console.log(`   Access at: /go/${TEST_DATA.restaurant.slug}?table=1`);

    // Sign out test user
    await supabase.auth.signOut();
  } catch (error) {
    console.error('❌ Failed to seed test database:', error);
    throw error;
  }
}

export default globalSetup;
