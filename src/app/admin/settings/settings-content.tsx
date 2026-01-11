'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase';
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

    const supabase = getClient();
    const { error } = await supabase
      .from('restaurants')
      .update({
        name,
        theme,
      })
      .eq('id', restaurant.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Ajustes del Restaurante</h1>
        <p className="text-muted-foreground mt-1">Personaliza tu restaurante</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          className="bg-card space-y-4 rounded-2xl border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold">Información básica</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del restaurante</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">Slug (URL)</label>
            <input
              type="text"
              value={restaurant.slug}
              disabled
              className="border-input bg-muted w-full rounded-xl border px-4 py-3 opacity-60"
            />
            <p className="text-muted-foreground text-xs">El slug no se puede cambiar</p>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div
          className="bg-card space-y-4 rounded-2xl border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Palette className="text-primary size-5" />
            <h2 className="font-semibold">Personalización</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Color primario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="size-12 cursor-pointer rounded-lg border"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="border-input bg-background flex-1 rounded-lg border px-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color secundario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="size-12 cursor-pointer rounded-lg border"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="border-input bg-background flex-1 rounded-lg border px-3"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 rounded-xl border p-4">
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
