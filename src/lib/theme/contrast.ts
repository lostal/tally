/**
 * WCAG Contrast Utilities
 *
 * Provides functions to calculate and verify contrast ratios
 * for accessibility compliance.
 */

/**
 * Calculate relative luminance from OKLCH lightness
 * OKLCH L is already perceptually uniform, so we can use it directly
 * for contrast estimation (with adjustment factor)
 */
export function estimateLuminance(oklchLightness: number): number {
  // OKLCH L correlates with perceived lightness
  // Apply gamma adjustment for luminance approximation
  return Math.pow(oklchLightness, 2.4);
}

/**
 * Calculate WCAG 2.1 contrast ratio between two luminance values
 */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA for normal text (4.5:1)
 */
export function meetsWCAG_AA(foregroundL: number, backgroundL: number): boolean {
  return contrastRatio(foregroundL, backgroundL) >= 4.5;
}

/**
 * Check if contrast meets WCAG AA for large text (3:1)
 */
export function meetsWCAG_AA_Large(foregroundL: number, backgroundL: number): boolean {
  return contrastRatio(foregroundL, backgroundL) >= 3.0;
}

/**
 * Check if contrast meets WCAG AAA for normal text (7:1)
 */
export function meetsWCAG_AAA(foregroundL: number, backgroundL: number): boolean {
  return contrastRatio(foregroundL, backgroundL) >= 7.0;
}

/**
 * Find the minimum lightness difference needed for WCAG AA
 */
export function minLightnessDifferenceForAA(backgroundL: number): number {
  // Solve for foreground L given 4.5:1 ratio
  const bgLum = estimateLuminance(backgroundL);

  // For light background, find dark foreground
  if (backgroundL > 0.5) {
    // (bgLum + 0.05) / (fgLum + 0.05) >= 4.5
    // fgLum <= (bgLum + 0.05) / 4.5 - 0.05
    const maxFgLum = (bgLum + 0.05) / 4.5 - 0.05;
    return Math.pow(Math.max(0, maxFgLum), 1 / 2.4);
  } else {
    // For dark background, find light foreground
    // (fgLum + 0.05) / (bgLum + 0.05) >= 4.5
    // fgLum >= 4.5 * (bgLum + 0.05) - 0.05
    const minFgLum = 4.5 * (bgLum + 0.05) - 0.05;
    return Math.pow(Math.min(1, minFgLum), 1 / 2.4);
  }
}

/**
 * Validate that a color scale has sufficient contrast
 * between text steps (11, 12) and background steps (1, 2, 3)
 */
export interface ContrastValidation {
  isValid: boolean;
  issues: string[];
  scores: Record<string, number>;
}

export function validateScaleContrast(lightnessScale: Record<number, number>): ContrastValidation {
  const issues: string[] = [];
  const scores: Record<string, number> = {};

  // Background steps
  const bgSteps = [1, 2, 3];
  // Text steps
  const textSteps = [11, 12];

  for (const bg of bgSteps) {
    for (const text of textSteps) {
      const bgL = estimateLuminance(lightnessScale[bg]);
      const textL = estimateLuminance(lightnessScale[text]);
      const ratio = contrastRatio(bgL, textL);
      const key = `step${bg}-vs-step${text}`;
      scores[key] = Math.round(ratio * 10) / 10;

      if (ratio < 4.5) {
        issues.push(`${key}: ${ratio.toFixed(1)}:1 (needs 4.5:1)`);
      }
    }
  }

  // Check solid backgrounds (9, 10) against white text
  for (const solid of [9, 10]) {
    const solidL = estimateLuminance(lightnessScale[solid]);
    const whiteL = estimateLuminance(0.98);
    const ratio = contrastRatio(solidL, whiteL);
    const key = `step${solid}-vs-white`;
    scores[key] = Math.round(ratio * 10) / 10;

    if (ratio < 4.5) {
      issues.push(`${key}: ${ratio.toFixed(1)}:1 (needs 4.5:1)`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    scores,
  };
}
