'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Restaurant, RestaurantTheme } from '@/types/database';

interface SettingsContentProps {
  restaurant: Restaurant;
}

export function SettingsContent({ restaurant }: SettingsContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState(restaurant.name);
  const [theme, setTheme] = React.useState<RestaurantTheme>(
    (restaurant.theme as RestaurantTheme) || { primaryColor: '#16a34a', accentColor: '#22c55e' }
  );
  const [saved, setSaved] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`/api/restaurants/${restaurant.slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, theme }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif">Ajustes del Restaurante</h1>
        <p className="text-muted-foreground mt-2">Personaliza la apariencia y datos de tu local</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          className="bg-card space-y-6 rounded-2xl border-2 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-serif text-xl">Información básica</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del restaurante</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-input bg-background w-full rounded-xl border-2 px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">Slug (URL)</label>
            <input
              type="text"
              value={restaurant.slug}
              disabled
              className="border-input bg-muted w-full rounded-xl border-2 px-4 py-3 opacity-60"
            />
            <p className="text-muted-foreground text-xs">El slug no se puede cambiar</p>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div
          className="bg-card space-y-6 rounded-2xl border-2 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Palette className="text-primary size-5" />
            <h2 className="font-serif text-xl">Personalización</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Color primario</label>
              <div className="flex gap-2">
                <div className="border-border size-12 overflow-hidden rounded-xl border-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="-m-1 size-14 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="border-input bg-background flex-1 rounded-xl border-2 px-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color secundario</label>
              <div className="flex gap-2">
                <div className="border-border size-12 overflow-hidden rounded-xl border-2">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="-m-1 size-14 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="border-input bg-background flex-1 rounded-xl border-2 px-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 rounded-xl border-2 p-4">
            <p className="text-muted-foreground mb-2 text-sm">Vista previa</p>
            <div className="flex gap-2">
              <div className="size-10 rounded-lg" style={{ backgroundColor: theme.primaryColor }} />
              <div className="size-10 rounded-lg" style={{ backgroundColor: theme.accentColor }} />
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              '✓ Guardado'
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
