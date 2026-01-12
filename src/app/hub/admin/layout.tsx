import { getRestaurantByOwner } from '@/lib/data';
import { parseThemeConfig } from '@/lib/theme';
import { AdminShell } from '@/components/admin/admin-shell';

import { ThemeInjector } from '@/components/providers/theme-injector';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout (Server Component)
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Try to get restaurant for current user
  let restaurant = await getRestaurantByOwner();

  // FALLBACK: If no user linked (dev/demo mode), use the first restaurant found
  if (!restaurant) {
    const supabase = await import('@/lib/supabase/server').then((m) => m.createClient());
    const { data } = await supabase.from('restaurants').select('*').limit(1).single();
    if (data) restaurant = data;
  }

  // Parse config (default to empty/default if no restaurant)
  const themeConfig = restaurant ? parseThemeConfig(restaurant.theme) : parseThemeConfig({});

  return (
    <ThemeInjector config={themeConfig}>
      <AdminShell>{children}</AdminShell>
    </ThemeInjector>
  );
}
