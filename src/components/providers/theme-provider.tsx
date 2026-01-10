'use client';

import * as React from 'react';

// Restaurant theme configuration
export interface RestaurantTheme {
  name: string;
  slug: string;
  // Primary brand color (HSL values without hsl())
  primaryHue: number;
  primarySaturation: number;
  primaryLightness: number;
  // Border radius multiplier (1 = default, 1.5 = more rounded, 0.5 = more square)
  radiusMultiplier?: number;
  // Logo URL (optional)
  logoUrl?: string;
}

// Default theme (tally brand)
const DEFAULT_THEME: RestaurantTheme = {
  name: 'tally',
  slug: 'demo',
  primaryHue: 217,
  primarySaturation: 91,
  primaryLightness: 60,
  radiusMultiplier: 1,
};

// Example restaurant themes
export const DEMO_RESTAURANTS: Record<string, RestaurantTheme> = {
  demo: DEFAULT_THEME,
  'trattoria-mario': {
    name: 'Trattoria Mario',
    slug: 'trattoria-mario',
    primaryHue: 15, // Warm terracotta orange
    primarySaturation: 75,
    primaryLightness: 50,
    radiusMultiplier: 1.2,
  },
  'sushi-zen': {
    name: 'Sushi Zen',
    slug: 'sushi-zen',
    primaryHue: 0, // Deep red
    primarySaturation: 72,
    primaryLightness: 45,
    radiusMultiplier: 0.6, // More angular
  },
  'swiss-bistro': {
    name: 'Swiss Bistro',
    slug: 'swiss-bistro',
    primaryHue: 0, // Neutral black
    primarySaturation: 0,
    primaryLightness: 15,
    radiusMultiplier: 0.8,
  },
};

interface ThemeContextValue {
  theme: RestaurantTheme;
  setTheme: (theme: RestaurantTheme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: RestaurantTheme;
}

export function ThemeProvider({ children, initialTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<RestaurantTheme>(initialTheme);

  // Inject CSS variables when theme changes
  React.useEffect(() => {
    const root = document.documentElement;
    const { primaryHue, primarySaturation, primaryLightness, radiusMultiplier = 1 } = theme;

    // Primary color variants
    root.style.setProperty('--primary', `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty(
      '--primary-hover',
      `${primaryHue} ${primarySaturation}% ${primaryLightness - 5}%`
    );
    root.style.setProperty(
      '--primary-active',
      `${primaryHue} ${primarySaturation}% ${primaryLightness - 10}%`
    );
    root.style.setProperty('--primary-subtle', `${primaryHue} ${primarySaturation}% 95%`);

    // Update oklch primary for shadcn compatibility
    const l = primaryLightness / 100;
    const c = (primarySaturation / 100) * 0.4; // Convert saturation to chroma
    const h = primaryHue;
    root.style.setProperty('--primary', `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`);

    // Border radius scaling
    const baseRadius = 0.625;
    root.style.setProperty('--radius', `${baseRadius * radiusMultiplier}rem`);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

// Helper to get theme by slug
export function getThemeBySlug(slug: string): RestaurantTheme {
  return DEMO_RESTAURANTS[slug] || DEFAULT_THEME;
}
