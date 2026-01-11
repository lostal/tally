'use client';

import * as React from 'react';
import { ThemeContext, useTheme } from '@/components/providers/theme-provider';
import { generateCompleteThemeStyles } from '@/lib/theme';
import type { RestaurantThemeConfig } from '@/types/theme';

interface ThemeInjectorProps {
  config: RestaurantThemeConfig;
  children: React.ReactNode;
}

export function ThemeInjector({ config, children }: ThemeInjectorProps) {
  const {
    isDark: globalIsDark,
    mode: globalMode,
    setMode: setGlobalMode,
    toggleDark,
    previewConfig, // Read preview overrides
    setPreviewConfig,
  } = useTheme();

  // Track sync state
  const [hasSynced, setHasSynced] = React.useState(false);

  // Sync Global Mode with Server Config
  React.useEffect(() => {
    // Preview mode overrides server config
    const targetMode = previewConfig.mode || config.mode;

    // Sync global mode if it differs (prioritizing preview)
    if (targetMode && targetMode !== globalMode) {
      if (!hasSynced) {
        setGlobalMode(targetMode);
      }
    }
    setHasSynced(true);
  }, [config.mode, previewConfig.mode, globalMode, setGlobalMode, hasSynced]);

  // MERGE Configs: Server + Preview
  const effectiveConfig = React.useMemo(() => {
    return {
      ...config,
      ...previewConfig, // Overrides take precedence
    };
  }, [config, previewConfig]);

  // Determine active mode
  const activeMode = React.useMemo(() => {
    // If preview config has a mode, use it immediately
    if (previewConfig.mode) return previewConfig.mode;

    // Fallback: Use Server Config (if not synced) or Global Mode
    if (!hasSynced) {
      return config.mode || 'auto';
    }
    return globalMode;
  }, [hasSynced, config.mode, globalMode, previewConfig.mode]);

  // Calculate effective resolved state based on activeMode
  const effectiveIsDark = React.useMemo(() => {
    if (activeMode === 'light') return false;
    if (activeMode === 'dark') return true;
    return globalIsDark;
  }, [activeMode, globalIsDark]);

  const effectiveThemeStyles = React.useMemo(() => {
    return generateCompleteThemeStyles(effectiveConfig, effectiveIsDark);
  }, [effectiveConfig, effectiveIsDark]);

  // Override Context for children
  const contextOverride = React.useMemo(
    () => ({
      mode: activeMode,
      isDark: effectiveIsDark,
      setMode: setGlobalMode,
      toggleDark,
      previewConfig,
      setPreviewConfig,
    }),
    [activeMode, effectiveIsDark, setGlobalMode, toggleDark, previewConfig, setPreviewConfig]
  );

  return (
    <ThemeContext.Provider value={contextOverride}>
      <div
        className="bg-background text-foreground min-h-dvh w-full transition-colors duration-200"
        style={effectiveThemeStyles as React.CSSProperties}
        data-theme-injector="true"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
