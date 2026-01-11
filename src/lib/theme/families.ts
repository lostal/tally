/**
 * Theme Family Configurations
 *
 * Designed to cover the full spectrum of restaurant brand colors:
 * - Red/Terracotta: Fast food, trattorias, energy
 * - Orange/Amber: Family restaurants, social dining
 * - Green/Sage: Organic, healthy, vegetarian
 * - Blue/Ocean: Seafood, premium, trust
 * - Brown/Coffee: Bakeries, cafés, artisanal
 * - Gold/Cream: Luxury, fine dining
 * - Neutral: Minimal, modern
 *
 * All families use OKLCH with low chroma for "Warm Minimalism" aesthetic.
 */

export const THEME_FAMILIES = {
  // Warm neutral - the default Tally aesthetic
  default: {
    name: 'Neutro',
    description: 'Minimal y elegante',
    baseHue: 60,
    hueRange: [50, 70] as const,
    chroma: 0.015,
    chromaRange: [0.01, 0.02] as const,
  },

  // Red-orange for trattorias, fast-casual, energetic brands
  terracotta: {
    name: 'Terracotta',
    description: 'Mediterráneo, cálido',
    baseHue: 25,
    hueRange: [15, 35] as const,
    chroma: 0.06,
    chromaRange: [0.04, 0.08] as const,
  },

  // True orange for family restaurants, social dining
  amber: {
    name: 'Ámbar',
    description: 'Acogedor, social',
    baseHue: 55,
    hueRange: [45, 65] as const,
    chroma: 0.055,
    chromaRange: [0.04, 0.07] as const,
  },

  // Forest/sage green for organic, healthy, vegetarian
  sage: {
    name: 'Salvia',
    description: 'Orgánico, natural',
    baseHue: 145,
    hueRange: [130, 160] as const,
    chroma: 0.04,
    chromaRange: [0.025, 0.055] as const,
  },

  // Deep green for premium organic, farm-to-table
  forest: {
    name: 'Bosque',
    description: 'Premium eco, farm-to-table',
    baseHue: 165,
    hueRange: [155, 180] as const,
    chroma: 0.035,
    chromaRange: [0.02, 0.05] as const,
  },

  // Ocean blue for seafood, coastal restaurants
  ocean: {
    name: 'Océano',
    description: 'Marisquería, costero',
    baseHue: 220,
    hueRange: [200, 240] as const,
    chroma: 0.035,
    chromaRange: [0.02, 0.05] as const,
  },

  // Cool slate for modern, tech-forward, upscale
  slate: {
    name: 'Pizarra',
    description: 'Moderno, premium',
    baseHue: 250,
    hueRange: [235, 265] as const,
    chroma: 0.02,
    chromaRange: [0.01, 0.03] as const,
  },

  // Warm brown for bakeries, cafés, artisanal
  coffee: {
    name: 'Café',
    description: 'Artesanal, panadería',
    baseHue: 45,
    hueRange: [35, 55] as const,
    chroma: 0.045,
    chromaRange: [0.03, 0.06] as const,
  },

  // Cream/gold for luxury, fine dining
  champagne: {
    name: 'Champagne',
    description: 'Lujo, fine dining',
    baseHue: 85,
    hueRange: [75, 95] as const,
    chroma: 0.03,
    chromaRange: [0.02, 0.04] as const,
  },

  // Dusty rose for modern bistros, wine bars
  rose: {
    name: 'Rosé',
    description: 'Bistró, vinoteca',
    baseHue: 350,
    hueRange: [340, 360] as const,
    chroma: 0.035,
    chromaRange: [0.02, 0.05] as const,
  },
} as const;

export type ThemeFamily = keyof typeof THEME_FAMILIES;

export interface ThemeFamilyConfig {
  name: string;
  description: string;
  baseHue: number;
  hueRange: readonly [number, number];
  chroma: number;
  chromaRange: readonly [number, number];
}

/**
 * 12-step lightness scale for light mode
 * Follows Radix UI conventions
 */
export const LIGHTNESS_SCALE_LIGHT = {
  1: 0.985, // App background
  2: 0.97, // Subtle background
  3: 0.94, // UI element background
  4: 0.91, // Hovered UI element
  5: 0.88, // Active/selected UI element
  6: 0.82, // Subtle borders
  7: 0.74, // UI element borders
  8: 0.64, // Hovered borders
  9: 0.55, // Solid backgrounds
  10: 0.5, // Hovered solid backgrounds
  11: 0.38, // Low-contrast text
  12: 0.22, // High-contrast text
} as const;

/**
 * 12-step lightness scale for dark mode (inverted)
 */
export const LIGHTNESS_SCALE_DARK = {
  1: 0.12, // App background
  2: 0.14, // Subtle background
  3: 0.18, // UI element background
  4: 0.22, // Hovered UI element
  5: 0.26, // Active/selected UI element
  6: 0.32, // Subtle borders
  7: 0.4, // UI element borders
  8: 0.5, // Hovered borders
  9: 0.55, // Solid backgrounds
  10: 0.6, // Hovered solid backgrounds
  11: 0.75, // Low-contrast text
  12: 0.93, // High-contrast text
} as const;

export type ColorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
