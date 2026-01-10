// lib/color-system.ts

/**
 * Sistema de color basado en HSL para máxima flexibilidad
 * Cada tema de restaurante solo cambia el HUE, mantenemos S y L consistentes
 */

export const colorSystem = {
  // NEUTRAL (Backbone de toda la UI)
  neutral: {
    0: '0 0% 100%', // Blanco puro
    50: '0 0% 98%', // Background sutil
    100: '240 5% 96%', // Cards, surfaces
    200: '240 6% 90%', // Borders, dividers
    300: '240 5% 84%', // Disabled backgrounds
    400: '240 4% 64%', // Placeholder text
    500: '240 4% 46%', // Secondary text
    600: '240 5% 34%', // Body text
    700: '240 6% 25%', // Headers
    800: '240 6% 15%', // Strong emphasis
    900: '240 10% 4%', // Foreground máximo
  },

  // SEMANTIC COLORS (Universales, no cambian por tema)
  semantic: {
    success: '142 76% 36%', // Verde oscuro (no neon)
    warning: '38 92% 50%', // Amber
    error: '0 84% 60%', // Rojo (no agresivo)
    info: '217 91% 60%', // Azul cielo
  },

  // ACCENT (Dinámico por restaurante)
  // Estos son ejemplos, se sobrescriben con CSS vars
  accent: {
    primary: '217 91% 60%', // Azul default
    primaryHover: '217 91% 50%',
    primaryActive: '217 91% 40%',
  },
} as const;

/**
 * Función para generar palette completa desde un HUE
 * Mantiene saturación y luminosidad consistentes
 */
export function generateAccentPalette(hue: number) {
  return {
    primary: `${hue} 70% 50%`,
    primaryHover: `${hue} 70% 45%`,
    primaryActive: `${hue} 70% 40%`,
    primaryForeground: `0 0% 100%`, // Siempre blanco sobre accent
    primarySubtle: `${hue} 70% 95%`, // Para backgrounds
  };
}
