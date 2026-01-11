'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { THEME_FAMILIES, generateColorScale, oklchToHex } from '@/lib/theme';
import type { ThemeFamily } from '@/lib/theme';
import type { Restaurant } from '@/types/database';
import type { RestaurantThemeConfig } from '@/types/theme';
import { cn } from '@/lib/utils';

interface SettingsContentProps {
  restaurant: Restaurant;
}

// Order families by color wheel for visual coherence
const FAMILY_ORDER: ThemeFamily[] = [
  'default',
  'champagne',
  'amber',
  'terracotta',
  'rose',
  'coffee',
  'sage',
  'forest',
  'ocean',
  'slate',
];

export function SettingsContent({ restaurant }: SettingsContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState(restaurant.name);
  const [saved, setSaved] = React.useState(false);

  // Parse existing theme or use defaults
  const existingTheme = (restaurant.theme as RestaurantThemeConfig) || {};
  const [selectedFamily, setSelectedFamily] = React.useState<ThemeFamily>(
    existingTheme.family || 'default'
  );

  // Get preview colors for selected family
  const previewScale = React.useMemo(() => generateColorScale(selectedFamily), [selectedFamily]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const themeConfig: RestaurantThemeConfig = {
      family: selectedFamily,
      mode: 'auto',
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

          <div className="grid gap-3 sm:grid-cols-2">
            {FAMILY_ORDER.map((family) => {
              const config = THEME_FAMILIES[family];
              const scale = generateColorScale(family);
              const isSelected = selectedFamily === family;

              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => setSelectedFamily(family)}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-foreground shadow-lg'
                      : 'border-border hover:border-foreground/30'
                  )}
                >
                  {/* Color bar at top */}
                  <div className="flex h-10">
                    {[3, 5, 7, 9, 11].map((step) => (
                      <div
                        key={step}
                        className="flex-1"
                        style={{ backgroundColor: oklchToHex(scale[step as 3]) }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <p className="text-muted-foreground text-sm">{config.description}</p>
                    </div>
                    {isSelected && (
                      <div className="bg-foreground text-background flex size-6 items-center justify-center rounded-full">
                        <Check className="size-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div
            className="mt-6 rounded-2xl border-2 p-5"
            style={{ backgroundColor: oklchToHex(previewScale[2]) }}
          >
            <p className="mb-3 text-sm font-medium" style={{ color: oklchToHex(previewScale[11]) }}>
              Vista previa
            </p>
            <div className="flex gap-3">
              <div
                className="rounded-xl px-5 py-3 text-sm font-semibold"
                style={{
                  backgroundColor: oklchToHex(previewScale[9]),
                  color: oklchToHex(previewScale[1]),
                }}
              >
                Botón primario
              </div>
              <div
                className="rounded-xl border-2 px-5 py-3 text-sm font-medium"
                style={{
                  backgroundColor: oklchToHex(previewScale[3]),
                  borderColor: oklchToHex(previewScale[7]),
                  color: oklchToHex(previewScale[11]),
                }}
              >
                Secundario
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
