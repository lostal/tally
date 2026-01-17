import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MenuContent } from './menu-content';

/**
 * Menu Management Page
 *
 * Manage categories and products
 */
export default async function MenuPage() {
  const supabase = await createClient();

  // Check authentication (using getUser for server-side security)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Get restaurant (demo - first one)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, slug')
    .limit(1)
    .single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  // Get categories with products
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order', { ascending: true });

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order', { ascending: true });

  return (
    <MenuContent
      restaurantId={restaurant.id}
      restaurantSlug={restaurant.slug}
      categories={categories || []}
      products={products || []}
    />
  );
}
