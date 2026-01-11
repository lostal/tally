import { getRestaurantBySlug } from '@/lib/data';
import { parseThemeConfig, generateCompleteThemeStyles } from '@/lib/theme';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Restaurant Layout with Dynamic Theming
 *
 * Fetches restaurant config and applies theme CSS variables.
 * Theme is applied via inline styles to avoid hydration issues.
 */
export default async function RestaurantLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  // Fetch restaurant for theme config
  const restaurant = await getRestaurantBySlug(slug);

  // Parse theme or use defaults
  const themeConfig = parseThemeConfig(restaurant?.theme);

  // Generate CSS variables for light mode (dark mode handled by CSS)
  const themeStyles = generateCompleteThemeStyles(themeConfig, false);

  // Convert to React style object (CSS custom properties)
  const styleVars: React.CSSProperties = {};
  for (const [key, value] of Object.entries(themeStyles)) {
    // React accepts CSS vars as-is in style objects
    (styleVars as Record<string, string>)[key] = value;
  }

  return (
    <div style={styleVars} className="contents">
      {children}
    </div>
  );
}
