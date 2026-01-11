import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsContent } from './settings-content';

/**
 * Restaurant Settings Page
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { data: restaurant } = await supabase.from('restaurants').select('*').limit(1).single();

  if (!restaurant) {
    return <div>No hay restaurante configurado</div>;
  }

  return <SettingsContent restaurant={restaurant} />;
}
