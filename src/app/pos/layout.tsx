import { getRestaurantByOwner } from '@/lib/data';
import { parseThemeConfig, generateCompleteThemeStyles } from '@/lib/theme';
import { PosShell } from '@/components/pos/pos-shell';

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

  // Generate theme styles
  let themeStyles: Record<string, string> = {};
  if (restaurant) {
    const themeConfig = parseThemeConfig(restaurant.theme);
    themeStyles = generateCompleteThemeStyles(themeConfig, false);
  }

  return (
    <div id="pos-theme-provider" className="contents" style={themeStyles as React.CSSProperties}>
      <PosShell>{children}</PosShell>
    </div>
  );
}
