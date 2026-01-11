/**
 * OKLCH Color Generator
 *
 * Generates accessible color scales using OKLCH color space.
 * OKLCH provides perceptually uniform lightness, making contrast predictable.
 */

import {
  THEME_FAMILIES,
  LIGHTNESS_SCALE_LIGHT,
  LIGHTNESS_SCALE_DARK,
  type ThemeFamily,
  type ColorStep,
} from './families';

export interface ColorScale {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
}

export interface GeneratedTheme {
  primary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
}

/**
 * Clamp hue within family range
 */
function clampHue(hue: number, range: readonly [number, number]): number {
  return Math.max(range[0], Math.min(range[1], hue));
}

/**
 * Generate a single OKLCH color string
 */
function oklch(lightness: number, chroma: number, hue: number): string {
  // Ensure values are in valid ranges
  const l = Math.max(0, Math.min(1, lightness));
  const c = Math.max(0, Math.min(0.4, chroma));
  const h = ((hue % 360) + 360) % 360;

  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`;
}

/**
 * Generate a 12-step color scale for a theme family
 */
export function generateColorScale(
  family: ThemeFamily,
  options: {
    hueOffset?: number;
    isDark?: boolean;
  } = {}
): ColorScale {
  const { hueOffset = 0, isDark = false } = options;
  const config = THEME_FAMILIES[family];

  const hue = clampHue(config.baseHue + hueOffset, config.hueRange);
  const chroma = config.chroma;
  const lightnessScale = isDark ? LIGHTNESS_SCALE_DARK : LIGHTNESS_SCALE_LIGHT;

  const scale: Record<number, string> = {};

  for (let step = 1; step <= 12; step++) {
    const lightness = lightnessScale[step as ColorStep];
    // Reduce chroma slightly for very light/dark steps
    const adjustedChroma = step <= 2 || step >= 11 ? chroma * 0.7 : chroma;
    scale[step] = oklch(lightness, adjustedChroma, hue);
  }

  return scale as ColorScale;
}

/**
 * Generate complete theme with primary, accent, and neutral scales
 */
export function generateTheme(
  primaryFamily: ThemeFamily,
  options: {
    accentFamily?: ThemeFamily;
    hueOffset?: number;
    isDark?: boolean;
  } = {}
): GeneratedTheme {
  const { accentFamily = primaryFamily, hueOffset = 0, isDark = false } = options;

  return {
    primary: generateColorScale(primaryFamily, { hueOffset, isDark }),
    accent: generateColorScale(accentFamily, { isDark }),
    neutral: generateColorScale('stone', { isDark }),
  };
}

/**
 * Generate CSS custom properties from a color scale
 */
export function scaleToCSS(scale: ColorScale, prefix: string = 'color'): Record<string, string> {
  const vars: Record<string, string> = {};

  for (let step = 1; step <= 12; step++) {
    vars[`--${prefix}-${step}`] = scale[step as ColorStep];
  }

  return vars;
}

/**
 * Generate all CSS variables for a complete theme
 */
export function themeToCSS(theme: GeneratedTheme): Record<string, string> {
  return {
    ...scaleToCSS(theme.primary, 'primary'),
    ...scaleToCSS(theme.accent, 'accent'),
    ...scaleToCSS(theme.neutral, 'neutral'),
  };
}

/**
 * Convert OKLCH to approximate hex (for preview/fallback)
 * Note: This is an approximation, browser OKLCH support is preferred
 */
export function oklchToHex(oklchString: string): string {
  // Parse oklch(L% C H)
  const match = oklchString.match(/oklch\(([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!match) return '#888888';

  const L = parseFloat(match[1]) / 100;
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]);

  // Simplified conversion (approximation)
  // For accurate conversion, use a library like culori
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);

  // OKLab to linear sRGB (approximate)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bVal = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Clamp and gamma correct
  const toGamma = (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 255;
    return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255);
  };

  const rHex = toGamma(r).toString(16).padStart(2, '0');
  const gHex = toGamma(g).toString(16).padStart(2, '0');
  const bHex = toGamma(bVal).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
