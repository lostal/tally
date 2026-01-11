/**
 * Theme Application Utilities
 *
 * Functions to apply restaurant theme to CSS custom properties
 */

import { generateTheme, themeToCSS, type ThemeFamily } from '@/lib/theme';
import { RADIUS_VALUES, type RestaurantThemeConfig, DEFAULT_THEME_CONFIG } from '@/types/theme';

/**
 * Parse theme from database JSON to typed config
 */
export function parseThemeConfig(themeJson: unknown): RestaurantThemeConfig {
  if (!themeJson || typeof themeJson !== 'object') {
    return DEFAULT_THEME_CONFIG;
  }

  const config = themeJson as Record<string, unknown>;

  return {
    family: (config.family as ThemeFamily) || DEFAULT_THEME_CONFIG.family,
    accentFamily: config.accentFamily as ThemeFamily | undefined,
    hueOffset:
      typeof config.hueOffset === 'number'
        ? Math.max(-15, Math.min(15, config.hueOffset))
        : DEFAULT_THEME_CONFIG.hueOffset,
    mode: ['auto', 'light', 'dark'].includes(config.mode as string)
      ? (config.mode as 'auto' | 'light' | 'dark')
      : DEFAULT_THEME_CONFIG.mode,
    radiusScale: ['sm', 'md', 'lg'].includes(config.radiusScale as string)
      ? (config.radiusScale as 'sm' | 'md' | 'lg')
      : DEFAULT_THEME_CONFIG.radiusScale,
  };
}

/**
 * Generate all CSS custom properties for a theme
 */
export function generateThemeStyles(
  config: RestaurantThemeConfig,
  isDark: boolean = false
): Record<string, string> {
  const theme = generateTheme(config.family, {
    accentFamily: config.accentFamily,
    hueOffset: config.hueOffset || 0,
    isDark,
  });

  const colorVars = themeToCSS(theme);
  const radiusScale = config.radiusScale || 'md';
  const radii = RADIUS_VALUES[radiusScale];

  return {
    ...colorVars,
    '--radius-base': radii.base,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--radius-xl': radii.xl,
    '--radius-2xl': radii['2xl'],
  };
}

/**
 * Convert CSS vars object to inline style string
 */
export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Map OKLCH primary colors to semantic CSS variables
 * Uses actual color values, not var() references
 * Includes both --var and --color-var for Tailwind v4 compatibility
 */
export function mapToSemanticVars(
  colorVars: Record<string, string>,
  isDark: boolean
): Record<string, string> {
  // p = primary (brand), a = accent, n = neutral (backgrounds/text)
  const p = (step: number) => colorVars[`--primary-${step}`] || '';
  const a = (step: number) => colorVars[`--accent-${step}`] || colorVars[`--primary-${step}`] || '';
  const n = (step: number) =>
    colorVars[`--neutral-${step}`] || colorVars[`--primary-${step}`] || '';

  // Build both --var and --color-var for Tailwind v4 @theme compatibility
  const vars: Record<string, string> = {};

  // Background - Always use Neutral scale (Warm White aesthetic)
  vars['--background'] = n(1);
  vars['--color-background'] = n(1);

  // Foreground - Always use Neutral scale (Warm Black aesthetic)
  vars['--foreground'] = n(12);
  vars['--color-foreground'] = n(12);

  // Card - Neutral scale
  vars['--card'] = isDark ? n(2) : n(1); // Or n(1) for cleaner look? n(1) is base bg. card usually n(1) in modern web if bg is slightly tinted.
  // User wants "clean/white". Let's stick to n(1) or n(2). n(1) is safest for "Off White".
  // If BG is n(1), Card should be n(1) + border? Or n(2) (slightly darker)?
  // Realfood uses clean backgrounds. Often n(1).
  vars['--color-card'] = isDark ? n(2) : n(1);
  vars['--card-foreground'] = n(12);
  vars['--color-card-foreground'] = n(12);

  // Popover - Neutral scale
  vars['--popover'] = isDark ? n(2) : n(1);
  vars['--color-popover'] = isDark ? n(2) : n(1);
  vars['--popover-foreground'] = n(12);
  vars['--color-popover-foreground'] = n(12);

  // Primary - Brand scale (Deep Colors)
  vars['--primary'] = p(9);
  vars['--color-primary'] = p(9);
  // Force Light/White text on Primary button (Step 1 neutral = Warm White)
  vars['--primary-foreground'] = n(1);
  vars['--color-primary-foreground'] = n(1);

  // Secondary - Neutral scale (Subtle buttons)
  vars['--secondary'] = n(3); // n(3) is subtle grey/beige
  vars['--color-secondary'] = n(3);
  vars['--secondary-foreground'] = n(12);
  vars['--color-secondary-foreground'] = n(12);

  // Muted - Neutral scale
  vars['--muted'] = n(2);
  vars['--color-muted'] = n(2);
  vars['--muted-foreground'] = n(11); // Soft text
  vars['--color-muted-foreground'] = n(11);

  // Accent - Brand scale (Highlights)
  vars['--accent'] = a(3); // Soft background accent usually. Or a(9) text?
  // Tailwind accent usually means hover state for ghost buttons or list items.
  // Should be subtle.
  vars['--accent'] = n(2); // Use neutral for hover states to keep it clean?
  // User wants "Brand" feel? Maybe p(2)?
  // Let's use p(2) for subtle brand tint on hovers.
  vars['--color-accent'] = isDark ? p(2) : p(2);
  vars['--accent-foreground'] = p(11); // Dark brand text
  vars['--color-accent-foreground'] = p(11);

  // Border and Input - Neutral scale (Clean borders)
  vars['--border'] = n(6);
  vars['--color-border'] = n(6);
  vars['--input'] = n(6);
  vars['--color-input'] = n(6);

  // Ring - Brand scale
  vars['--ring'] = p(8);
  vars['--color-ring'] = p(8);

  return vars;
}

/**
 * Generate complete theme style object for HTML element
 */
export function generateCompleteThemeStyles(
  config: RestaurantThemeConfig,
  isDark: boolean = false
): Record<string, string> {
  const baseVars = generateThemeStyles(config, isDark);
  const semanticVars = mapToSemanticVars(baseVars, isDark);

  return {
    ...baseVars,
    ...semanticVars,
  };
}
