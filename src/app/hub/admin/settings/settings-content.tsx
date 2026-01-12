'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Check, Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { THEME_FAMILIES, generateColorScale } from '@/lib/theme';
import type { ThemeFamily } from '@/lib/theme';
import type { Restaurant } from '@/types/database';
import type { RestaurantThemeConfig } from '@/types/theme';
import { cn } from '@/lib/utils';

interface SettingsContentProps {
  restaurant: Restaurant;
}

// Logical order for color picker
const FAMILY_ORDER: ThemeFamily[] = [
  'default', // Neutral
  'tomato', // Red
  'carrot', // Orange
  'yolk', // Yellow
  'basil', // Light Green
  'kale', // Dark Green
  'blueberry', // Blue
  'beet', // Pink/Magenta
  'espresso', // Brown
  'charcoal', // Dark Grey
];

export function SettingsContent({ restaurant }: SettingsContentProps) {
  const router = useRouter();
  const { setMode: setGlobalMode, isDark, setPreviewConfig } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState(restaurant.name);
  const [saved, setSaved] = React.useState(false);

  // Parse existing theme (may be legacy RestaurantTheme or new RestaurantThemeConfig)
  const existingTheme = (restaurant.theme as unknown as RestaurantThemeConfig) || {};
  const [selectedFamily, setSelectedFamily] = React.useState<ThemeFamily>(
    existingTheme.family || 'default'
  );
  const [hueOffset, setHueOffset] = React.useState(existingTheme.hueOffset || 0);
  const [mode, setMode] = React.useState<'auto' | 'light' | 'dark'>(
    (existingTheme.mode as 'auto' | 'light' | 'dark') || 'auto'
  );

  // Preview with offset
  const previewScale = React.useMemo(
    () => generateColorScale(selectedFamily, { hueOffset, isDark }),
    [selectedFamily, hueOffset, isDark]
  );

  // Sync with Global Preview
  React.useEffect(() => {
    setPreviewConfig({
      family: selectedFamily,
      hueOffset,
      mode,
      radiusScale: 'md', // Keep consistent with save logic
    });
  }, [selectedFamily, hueOffset, mode, setPreviewConfig]);

  // Cleanup preview on unmount
  React.useEffect(() => {
    return () => setPreviewConfig({});
  }, [setPreviewConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const themeConfig: RestaurantThemeConfig = {
      family: selectedFamily,
      hueOffset: hueOffset !== 0 ? hueOffset : undefined,
      mode: mode,
      radiusScale: 'md',
    };

    try {
      const response = await fetch(`/api/restaurants/${restaurant.slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, theme: themeConfig }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl">Ajustes</h1>
        <p className="text-muted-foreground mt-1">Personaliza tu restaurante</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Información
          </h2>
          <div className="bg-card rounded-2xl border-2 p-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Nombre del restaurante</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-xl border-2 px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
              />
            </label>
          </div>
        </motion.section>

        {/* Theme Selection */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Paleta de colores
          </h2>

          {/* Mode Selection */}
          <div className="bg-card rounded-2xl border-2 p-1">
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'auto', label: 'Sistema', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setMode(option.value as 'auto' | 'light' | 'dark');
                      setGlobalMode(option.value as 'auto' | 'light' | 'dark');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {FAMILY_ORDER.map((family) => {
              const config = THEME_FAMILIES[family] || THEME_FAMILIES.default;
              const scale = generateColorScale(family);
              const isSelected = selectedFamily === family;

              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => {
                    setSelectedFamily(family);
                    setHueOffset(0); // Reset offset on family change
                  }}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-foreground ring-foreground/20 ring-2'
                      : 'border-border hover:border-foreground/40'
                  )}
                >
                  {/* Color swatch - Using direct OKLCH for accuracy */}
                  <div className="flex h-12">
                    <div className="flex-1" style={{ backgroundColor: scale[5] }} />
                    <div className="flex-1" style={{ backgroundColor: scale[7] }} />
                    <div className="flex-1" style={{ backgroundColor: scale[9] }} />
                  </div>
                  {/* Label */}
                  <div className="bg-card p-2 text-center">
                    <p className="text-xs font-medium">{config.name}</p>
                  </div>
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="bg-foreground text-background absolute top-1 right-1 flex size-5 items-center justify-center rounded-full">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hue Offset Slider - Integrated */}
          <div className="bg-card rounded-2xl border-2 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ajuste de tono</p>
                <p className="text-muted-foreground text-sm">Personaliza el matiz exacto</p>
              </div>
              <div className="bg-muted rounded-lg px-3 py-1.5 font-mono text-sm font-medium">
                {hueOffset > 0 ? `+${hueOffset}` : hueOffset}°
              </div>
            </div>
            <div className="mt-4">
              {/* Custom styled slider track */}
              <div className="relative h-3">
                {/* Gradient background showing hue range */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right,
                      ${generateColorScale(selectedFamily, { hueOffset: -15 })[9]},
                      ${generateColorScale(selectedFamily, { hueOffset: 0 })[9]},
                      ${generateColorScale(selectedFamily, { hueOffset: 15 })[9]}
                    )`,
                  }}
                />
                {/* Actual input */}
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={hueOffset}
                  onChange={(e) => setHueOffset(parseInt(e.target.value))}
                  className="[&::-webkit-slider-thumb]:bg-foreground absolute inset-0 h-3 w-full cursor-pointer appearance-none rounded-full bg-transparent [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {/* Live Preview - Mini POS Context */}
          {/* Live Preview - Simple Style Tile */}
          <div className="bg-background/40 rounded-3xl border-2 p-8 backdrop-blur-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* Left: Typography & Brand */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-serif text-2xl" style={{ color: previewScale[11] }}>
                    Tipografía
                  </h3>
                  <p className="text-muted-foreground text-sm">La identidad visual de tu marca.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${previewScale[9]}15`, color: previewScale[9] }}
                  >
                    Badge
                  </span>
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${previewScale[3]}`, color: previewScale[11] }}
                  >
                    Neutro
                  </span>
                </div>
              </div>

              {/* Right: Interactive Elements */}
              <div className="pointer-events-none flex-1 space-y-3 select-none">
                {/* Static Primary Button */}
                <div
                  className="flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-white shadow-md"
                  style={{ backgroundColor: previewScale[9] }}
                >
                  Botón Primario
                </div>

                {/* Static Secondary Button */}
                <div
                  className="flex h-10 w-full items-center justify-center rounded-md border bg-transparent text-sm font-medium"
                  style={{ borderColor: previewScale[6], color: previewScale[11] }}
                >
                  Secundario
                </div>

                {/* Toggle Switch */}
                <div
                  className="bg-background/50 flex items-center justify-between rounded-md border px-3 py-2"
                  style={{ borderColor: previewScale[4] }}
                >
                  <span className="text-sm font-medium" style={{ color: previewScale[11] }}>
                    Notificaciones
                  </span>
                  <div
                    className="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors"
                    style={{ backgroundColor: previewScale[9] }}
                  >
                    <div className="size-4 translate-x-3.5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-12 w-full rounded-xl text-base sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 size-5" />
                Guardado
              </>
            ) : (
              <>
                <Save className="mr-2 size-5" />
                Guardar cambios
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
