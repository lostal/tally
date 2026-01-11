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
 */
export function mapToSemanticVars(isDark: boolean): Record<string, string> {
  // These map the 12-step OKLCH scale to existing Tailwind/semantic variables
  return {
    // Backgrounds
    '--background': 'var(--primary-1)',
    '--background-subtle': 'var(--primary-2)',

    // Cards and surfaces
    '--card': isDark ? 'var(--primary-2)' : 'var(--primary-1)',
    '--card-foreground': 'var(--primary-12)',

    // Borders
    '--border': 'var(--primary-6)',

    // Primary (interactive elements)
    '--primary': 'var(--primary-9)',
    '--primary-foreground': isDark ? 'var(--primary-1)' : 'var(--primary-12)',

    // Secondary
    '--secondary': 'var(--primary-3)',
    '--secondary-foreground': 'var(--primary-11)',

    // Muted
    '--muted': 'var(--primary-4)',
    '--muted-foreground': 'var(--primary-11)',

    // Accent
    '--accent': 'var(--accent-9)',
    '--accent-foreground': isDark ? 'var(--accent-1)' : 'var(--accent-12)',

    // Text
    '--foreground': 'var(--primary-12)',

    // Input
    '--input': 'var(--primary-6)',
    '--ring': 'var(--accent-8)',
  };
}

/**
 * Generate complete theme style object for HTML element
 */
export function generateCompleteThemeStyles(
  config: RestaurantThemeConfig,
  isDark: boolean = false
): Record<string, string> {
  const baseVars = generateThemeStyles(config, isDark);
  const semanticVars = mapToSemanticVars(isDark);

  return {
    ...baseVars,
    ...semanticVars,
  };
}
