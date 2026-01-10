// lib/design-tokens.ts

export const tokens = {
  // SPACING (Sistema de 4px, pero usado con inteligencia)
  spacing: {
    xs: '0.25rem', // 4px  - Separación mínima entre elementos relacionados
    sm: '0.5rem', // 8px  - Padding interno pequeño
    md: '1rem', // 16px - Estándar, gap entre elementos
    lg: '1.5rem', // 24px - Secciones
    xl: '2rem', // 32px - Entre componentes principales
    '2xl': '3rem', // 48px - Separadores de sección
    '3xl': '4rem', // 64px - Hero spacing
    '4xl': '6rem', // 96px - Landing sections
  },

  // TYPOGRAPHY SCALE (Modular scale 1.25 - Major Third)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px - Metadata, timestamps
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - Secondary text
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px - Body text
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - Highlighted text
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px - Card titles
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px - Section headers
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Page titles
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Hero titles
    '5xl': ['3rem', { lineHeight: '1' }], // 48px - Display
  },

  // FONT WEIGHTS (Contrast dramático)
  fontWeight: {
    light: '300', // Para números grandes, displays
    normal: '400', // Body text
    medium: '500', // Subtle emphasis (evitar, preferir semibold)
    semibold: '600', // Títulos, CTAs
    bold: '700', // Evitar en general (demasiado pesado)
  },

  // BORDER RADIUS (Sistema de 8px)
  radius: {
    none: '0',
    sm: '0.25rem', // 4px  - Elementos pequeños (badges)
    md: '0.5rem', // 8px  - Botones, inputs
    lg: '0.75rem', // 12px - Cards
    xl: '1rem', // 16px - Modals
    '2xl': '1.5rem', // 24px - Hero cards
    full: '9999px', // Pills
  },

  // SHADOWS (Sutiles, no Material Design exagerado)
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  // TRANSITIONS
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '600ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Para pop-ins
  },
} as const;
