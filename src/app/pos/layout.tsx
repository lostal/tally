import { getRestaurantByOwner } from '@/lib/data';
import { parseThemeConfig } from '@/lib/theme';
import { PosShell } from '@/components/pos/pos-shell';

import { ThemeInjector } from '@/components/providers/theme-injector';

interface POSLayoutProps {
  children: React.ReactNode;
}

/**
 * POS Layout (Server Component)
 * Injects restaurant theme via inline styles
 */
export default async function POSLayout({ children }: POSLayoutProps) {
  // Try to get restaurant for current user (staff/owner)
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
      <PosShell>{children}</PosShell>
    </ThemeInjector>
  );
}
