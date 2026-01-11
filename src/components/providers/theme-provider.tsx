'use client';

import * as React from 'react';

/**
 * Theme Provider (Simplified)
 *
 * For now, we use a single default theme defined in globals.css.
 * In the future, this will support dynamic themes based on restaurant branding.
 */

// Restaurant theme configuration (for future dynamic theming)
export interface RestaurantTheme {
  name: string;
  slug: string;
}

// Default theme
const DEFAULT_THEME: RestaurantTheme = {
  name: 'tally',
  slug: 'default',
};

interface ThemeContextValue {
  theme: RestaurantTheme;
  setTheme: (theme: RestaurantTheme) => void;
  isDark: boolean;
  toggleDark: () => void;
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
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<RestaurantTheme>(DEFAULT_THEME);
  const [isDark, setIsDark] = React.useState(false);

  // Initialize dark mode from system preference
  React.useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkQuery.matches || document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = React.useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper to get theme by slug (for future use)
export function getThemeBySlug(slug: string): RestaurantTheme {
  return { name: slug, slug };
}
