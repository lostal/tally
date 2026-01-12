import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from './dashboard-content';

/**
 * Admin Dashboard Page
 *
 * Shows restaurant overview and quick stats
 */
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/admin/login');
  }

  // Get user's restaurant
  // For now, we'll just get the first restaurant (demo)
  // In production, this would be linked to the user's account
  const { data: restaurant } = await supabase.from('restaurants').select('*').limit(1).single();

  if (!restaurant) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No hay restaurante configurado</p>
      </div>
    );
  }

  // Get stats
  const { count: tableCount } = await supabase
    .from('tables')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id);

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id);

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id);

  const { data: occupiedTables } = await supabase
    .from('tables')
    .select('id')
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'occupied');

  return (
    <DashboardContent
      restaurant={restaurant}
      stats={{
        tables: tableCount || 0,
        products: productCount || 0,
        categories: categoryCount || 0,
        occupiedTables: occupiedTables?.length || 0,
      }}
    />
  );
}
