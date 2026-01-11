'use client';

import * as React from 'react';
import { THEME_FAMILIES, generateColorScale, oklchToHex } from '@/lib/theme';
import type { ThemeFamily } from '@/lib/theme';
import { cn } from '@/lib/utils';

// Order families by color wheel
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

/**
 * Theme Families Showcase
 * Clean, minimal presentation of all color families
 */
export function ThemeFamiliesShowcase() {
  const [isDark, setIsDark] = React.useState(false);
  const [selectedFamily, setSelectedFamily] = React.useState<ThemeFamily>('terracotta');

  const currentScale = React.useMemo(
    () => generateColorScale(selectedFamily, { isDark }),
    [selectedFamily, isDark]
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl">Familias de Color</h2>
          <p className="text-muted-foreground mt-1">
            10 paletas diseñadas para cubrir marcas de restauración
          </p>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
          )}
        >
          {isDark ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* All Families - Simple Color Bars */}
      <div className="space-y-3">
        {FAMILY_ORDER.map((family) => {
          const config = THEME_FAMILIES[family];
          const scale = generateColorScale(family, { isDark });
          const isSelected = selectedFamily === family;

          return (
            <button
              key={family}
              onClick={() => setSelectedFamily(family)}
              className={cn(
                'group flex w-full items-center gap-4 rounded-xl border-2 p-3 text-left transition-all',
                isSelected ? 'border-foreground' : 'hover:border-border border-transparent'
              )}
            >
              {/* 12-step scale */}
              <div className="flex flex-1 overflow-hidden rounded-lg">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => (
                  <div
                    key={step}
                    className="h-8 flex-1"
                    style={{ backgroundColor: oklchToHex(scale[step as 1]) }}
                  />
                ))}
              </div>

              {/* Label */}
              <div className="w-24 shrink-0">
                <p className="font-medium">{config.name}</p>
                <p className="text-muted-foreground text-xs">{config.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Family Detail */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: oklchToHex(currentScale[1]) }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl" style={{ color: oklchToHex(currentScale[12]) }}>
              {THEME_FAMILIES[selectedFamily].name}
            </h3>
            <p className="text-sm" style={{ color: oklchToHex(currentScale[11]) }}>
              {THEME_FAMILIES[selectedFamily].description}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: oklchToHex(currentScale[3]),
              color: oklchToHex(currentScale[11]),
            }}
          >
            Hue: {THEME_FAMILIES[selectedFamily].baseHue}°
          </span>
        </div>

        {/* Step labels */}
        <div className="mb-2 flex">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => (
            <div
              key={step}
              className="flex-1 text-center"
              style={{ color: oklchToHex(currentScale[11]) }}
            >
              <span className="text-xs">{step}</span>
            </div>
          ))}
        </div>

        {/* Large scale */}
        <div className="mb-6 flex overflow-hidden rounded-xl">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => (
            <div
              key={step}
              className="h-14 flex-1"
              style={{ backgroundColor: oklchToHex(currentScale[step as 1]) }}
            />
          ))}
        </div>

        {/* Usage hints */}
        <div
          className="grid grid-cols-5 gap-2 text-xs"
          style={{ color: oklchToHex(currentScale[11]) }}
        >
          <div className="rounded-lg p-2" style={{ backgroundColor: oklchToHex(currentScale[2]) }}>
            <strong>1-2</strong>
            <p>Fondos</p>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: oklchToHex(currentScale[4]) }}>
            <strong>3-5</strong>
            <p>UI, hover</p>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: oklchToHex(currentScale[6]) }}>
            <strong>6-8</strong>
            <p>Bordes</p>
          </div>
          <div
            className="rounded-lg p-2"
            style={{
              backgroundColor: oklchToHex(currentScale[9]),
              color: oklchToHex(currentScale[1]),
            }}
          >
            <strong>9-10</strong>
            <p>Sólidos</p>
          </div>
          <div
            className="rounded-lg p-2"
            style={{
              backgroundColor: oklchToHex(currentScale[11]),
              color: oklchToHex(currentScale[1]),
            }}
          >
            <strong>11-12</strong>
            <p>Texto</p>
          </div>
        </div>

        {/* Sample UI */}
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-xl px-5 py-3 text-sm font-semibold transition-transform active:scale-95"
            style={{
              backgroundColor: oklchToHex(currentScale[9]),
              color: oklchToHex(currentScale[1]),
            }}
          >
            Botón primario
          </button>
          <button
            className="rounded-xl border-2 px-5 py-3 text-sm font-medium transition-transform active:scale-95"
            style={{
              backgroundColor: oklchToHex(currentScale[3]),
              borderColor: oklchToHex(currentScale[7]),
              color: oklchToHex(currentScale[11]),
            }}
          >
            Secundario
          </button>
          <button
            className="rounded-xl px-5 py-3 text-sm font-medium transition-colors"
            style={{
              color: oklchToHex(currentScale[11]),
            }}
          >
            Terciario
          </button>
        </div>
      </div>
    </div>
  );
}
