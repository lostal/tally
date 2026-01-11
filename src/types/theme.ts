/**
 * Restaurant Theme Configuration Type
 *
 * Stored in restaurants.theme JSONB column
 */

import type { ThemeFamily } from '@/lib/theme';

export interface RestaurantThemeConfig {
  /** Primary color family */
  family: ThemeFamily;
  /** Optional accent color family (defaults to primary) */
  accentFamily?: ThemeFamily;
  /** Fine-tune hue adjustment (-15 to +15) */
  hueOffset?: number;
  /** Color mode preference */
  mode?: 'auto' | 'light' | 'dark';
  /** Border radius scale */
  radiusScale?: 'sm' | 'md' | 'lg';
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME_CONFIG: RestaurantThemeConfig = {
  family: 'default',
  accentFamily: undefined,
  hueOffset: 0,
  mode: 'auto',
  radiusScale: 'md',
};

/**
 * Radius values for each scale
 */
export const RADIUS_VALUES = {
  sm: {
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  md: {
    base: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
  lg: {
    base: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
  },
} as const;
