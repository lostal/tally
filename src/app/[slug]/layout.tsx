import { getRestaurantBySlug } from '@/lib/data';
import { parseThemeConfig, generateCompleteThemeStyles } from '@/lib/theme';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Restaurant Layout with Dynamic Theming
 *
 * Uses inline styles on the wrapper div. This is the most reliable way
 * to ensure CSS variables are inherited by all children, overriding
 * any global defaults.
 */
export default async function RestaurantLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  // Fetch restaurant for theme config
  const restaurant = await getRestaurantBySlug(slug);

  // Parse theme or use defaults
  const themeConfig = parseThemeConfig(restaurant?.theme);

  // Generate CSS variables
  const themeStyles = generateCompleteThemeStyles(themeConfig, false);

  return (
    <div id="theme-provider" className="contents" style={themeStyles as React.CSSProperties}>
      {children}
    </div>
  );
}
