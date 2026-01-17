import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TablesContent } from './tables-content';

/**
 * Table Management Page
 */
export default async function TablesPage() {
  const supabase = await createClient();

  // Check authentication (using getUser for server-side security)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, slug')
    .limit(1)
    .single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('number', { ascending: true });

  return (
    <TablesContent
      restaurantId={restaurant.id}
      restaurantSlug={restaurant.slug}
      tables={tables || []}
    />
  );
}
