// Theme Family Configurations
// Style: "Organic Modern" (inspired by realfood.gov)
// High saturation, deep brand colors, warm off-white backgrounds.

export const THEME_FAMILIES = {
  // Clean, crisp neutral check - TUNED TO #fdfbef / #0f0100 aesthetic
  default: {
    name: 'Harina',
    description: 'Blanco cálido orgánico',
    baseHue: 88, // Warm Yellow/Green tint for #fdfbef vibe
    hueRange: [80, 100] as const,
    chroma: 0.025, // Slight warmth, not sterile grey
    chromaRange: [0.01, 0.04] as const,
  },

  // Vibrant Tomato Red - Tuned to #a62115 (Deep)
  tomato: {
    name: 'Tomate',
    description: 'Rojo profundo orgánico',
    baseHue: 28, // Deep Warm Red
    hueRange: [20, 35] as const,
    chroma: 0.17,
    chromaRange: [0.14, 0.2] as const,
  },

  // Carrot Orange
  carrot: {
    name: 'Zanahoria',
    description: 'Naranja intenso',
    baseHue: 45, // Warm Intense Orange
    hueRange: [35, 55] as const,
    chroma: 0.16,
    chromaRange: [0.13, 0.19] as const,
  },

  // Egg Yolk Yellow/Gold
  yolk: {
    name: 'Yema',
    description: 'Amarillo cálido',
    baseHue: 75,
    hueRange: [65, 85] as const,
    chroma: 0.15,
    chromaRange: [0.12, 0.18] as const,
  },

  // Fresh Basil Green - Tuned to #203e1a (Deep Forest)
  basil: {
    name: 'Albahaca',
    description: 'Verde bosque profundo',
    baseHue: 136, // Cool Deep Green
    hueRange: [125, 145] as const,
    chroma: 0.11, // Lower chroma for "Forest" feel
    chromaRange: [0.08, 0.14] as const,
  },

  // Deep Kale Green / Teal
  kale: {
    name: 'Kale',
    description: 'Verde azulado profundo',
    baseHue: 175,
    hueRange: [165, 185] as const,
    chroma: 0.09,
    chromaRange: [0.06, 0.12] as const,
  },

  // Blueberry / Deep Blue
  blueberry: {
    name: 'Arándano',
    description: 'Azul índigo potente',
    baseHue: 265,
    hueRange: [255, 275] as const,
    chroma: 0.13,
    chromaRange: [0.1, 0.16] as const,
  },

  // Beetroot / Magenta
  beet: {
    name: 'Remolacha',
    description: 'Magenta tierra',
    baseHue: 335,
    hueRange: [325, 345] as const,
    chroma: 0.14,
    chromaRange: [0.11, 0.17] as const,
  },

  // Espresso Brown
  espresso: {
    name: 'Espresso',
    description: 'Café tostado oscuro',
    baseHue: 50,
    hueRange: [40, 60] as const,
    chroma: 0.06,
    chromaRange: [0.04, 0.08] as const,
  },

  // Charcoal Slate
  charcoal: {
    name: 'Carbón',
    description: 'Gris mineral',
    baseHue: 260,
    hueRange: [250, 270] as const,
    chroma: 0.02,
    chromaRange: [0.01, 0.05] as const,
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
 * OPTIMIZED FOR ORGANIC MODERN:
 * - Step 1: 0.985 (Warm White #fdfbef)
 * - Step 9: 0.45 (Deep Brand Color)
 * - Step 12: 0.12 (Warm Black #0f0100 equivalent)
 */
export const LIGHTNESS_SCALE_LIGHT = {
  1: 0.985, // Perfect "Off White"
  2: 0.965, // Subtle variation
  3: 0.94,
  4: 0.9,
  5: 0.84,
  6: 0.74,
  7: 0.62,
  8: 0.52,
  9: 0.45, // DEEP RICH BUTTONS (Requires white text)
  10: 0.38, // Hover state
  11: 0.25, // Secondary text
  12: 0.12, // High-contrast text - Deep Warm Black
} as const;

/**
 * 12-step lightness scale for dark mode
 */
export const LIGHTNESS_SCALE_DARK = {
  1: 0.12, // Warm deep bg
  2: 0.14,
  3: 0.18,
  4: 0.22,
  5: 0.28,
  6: 0.35,
  7: 0.45,
  8: 0.55,
  9: 0.65, // Lighter branding for dark mode contrast
  10: 0.72,
  11: 0.9,
  12: 0.99, // Bright text
} as const;

export type ColorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
