'use client';

import * as React from 'react';

/**
 * Theme Provider (Mode Only)
 *
 * Handles 'light' | 'dark' | 'auto' modes.
 * Currently decoupling explicit theme object state as it's handled by server/CSS.
 */

import type { RestaurantThemeConfig } from '@/types/theme';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  toggleDark: () => void;
  // Live Preview Support
  previewConfig: Partial<RestaurantThemeConfig>;
  setPreviewConfig: (config: Partial<RestaurantThemeConfig>) => void;
}

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

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
  const [mode, setMode] = React.useState<ThemeMode>('auto');
  const [isDark, setIsDark] = React.useState(false);
  const [previewConfig, setPreviewConfig] = React.useState<Partial<RestaurantThemeConfig>>({});

  // Unified logic for mode application
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyMode = () => {
      let shouldBeDark = false;

      if (mode === 'auto') {
        shouldBeDark = mediaQuery.matches;
      } else {
        shouldBeDark = mode === 'dark';
      }

      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    // Apply immediately
    applyMode();

    // Listen for system changes
    const listener = () => applyMode();
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode]);

  const toggleDark = React.useCallback(() => {
    setMode((prev) => {
      if (prev === 'auto') {
        return isDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        isDark,
        toggleDark,
        previewConfig,
        setPreviewConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
