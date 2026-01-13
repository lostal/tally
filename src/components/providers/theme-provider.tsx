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
  /** Default mode - defaults to 'light' for a clean first impression */
  defaultMode?: ThemeMode;
}

const STORAGE_KEY = 'tally-theme-mode';

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  // Initialize from localStorage if available, otherwise use default
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      return stored && ['light', 'dark', 'auto'].includes(stored) ? stored : defaultMode;
    } catch {
      return defaultMode;
    }
  });
  const [isDark, setIsDark] = React.useState(false);
  const [previewConfig, setPreviewConfig] = React.useState<Partial<RestaurantThemeConfig>>({});

  // Persist mode to localStorage
  const setMode = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Ignore storage errors
    }
  }, []);

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

      // Always explicitly set/remove the dark class
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply immediately
    applyMode();

    // Listen for system changes (only matters if mode is 'auto')
    const listener = () => applyMode();
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode]);

  const toggleDark = React.useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

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
