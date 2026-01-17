import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsContent } from './settings-content';

/**
 * Restaurant Settings Page
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  // Check authentication (using getUser for server-side security)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { data: restaurant } = await supabase.from('restaurants').select('*').limit(1).single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  return <SettingsContent restaurant={restaurant} />;
}
