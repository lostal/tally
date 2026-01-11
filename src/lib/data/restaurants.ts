import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Table = Database['public']['Tables']['tables']['Row'];

export interface RestaurantWithTable {
  restaurant: Restaurant;
  table: Table | null;
}

/**
 * Get restaurant by slug
 * Used on customer-facing pages after QR scan
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('[getRestaurantBySlug]', error);
    return null;
  }

  return data;
}

/**
 * Get table by QR code or table number for a restaurant
 */
export async function getTableByNumber(
  restaurantId: string,
  tableNumber: string
): Promise<Table | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('number', tableNumber)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('[getTableByNumber]', error);
    return null;
  }

  return data;
}

/**
 * Get first available table for restaurant (for demo/testing)
 */
export async function getFirstTable(restaurantId: string): Promise<Table | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('number', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('[getFirstTable]', error);
    return null;
  }

  return data;
}

/**
 * Get restaurant with default table (for initial page load)
 */
export async function getRestaurantWithTable(
  slug: string,
  tableNumber?: string
): Promise<RestaurantWithTable | null> {
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return null;

  const table = tableNumber
    ? await getTableByNumber(restaurant.id, tableNumber)
    : await getFirstTable(restaurant.id);

  return { restaurant, table };
}
