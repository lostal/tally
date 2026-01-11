'use client';

import * as React from 'react';
import { ThemeFamily, THEME_FAMILIES, generateColorScale, oklchToHex } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Moon, Sun, Check, Zap, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeFamiliesShowcase() {
  const [activeFamily, setActiveFamily] = React.useState<ThemeFamily>('tomato');
  const [hueOffset, setHueOffset] = React.useState(0);
  const [isDark, setIsDark] = React.useState(false);

  // Use the same logical order as settings
  const families: ThemeFamily[] = [
    'default',
    'tomato',
    'carrot',
    'yolk',
    'basil',
    'kale',
    'blueberry',
    'beet',
    'espresso',
    'charcoal',
  ];

  // Generate scale for active family
  const scale = React.useMemo(
    () => generateColorScale(activeFamily, { hueOffset }),
    [activeFamily, hueOffset]
  );

  return (
    <div
      className={cn(
        'space-y-8 rounded-3xl border p-8 transition-colors duration-500',
        isDark ? 'border-[#3d3a36] bg-[#1a1815]' : 'border-[#e0ddd9] bg-[#fafaf8]'
      )}
    >
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3
            className={cn(
              'font-serif text-2xl font-medium',
              isDark ? 'text-[#f5f4f2]' : 'text-[#1a1815]'
            )}
          >
            Vibrant Organic Themes
          </h3>
          <p className={cn('mt-1 text-sm', isDark ? 'text-[#a09a94]' : 'text-[#6b6660]')}>
            Inspirado en Realfood.gov - Colores saturados y alto contraste
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-full bg-black/5 p-1 pr-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={cn(
              'rounded-full p-2 transition-all',
              isDark ? 'bg-[#3d3a36] text-[#f5f4f2]' : 'bg-white text-yellow-600 shadow-sm'
            )}
          >
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <span
            className={cn(
              'text-xs font-medium tracking-wider uppercase',
              isDark ? 'text-[#a09a94]' : 'text-[#6b6660]'
            )}
          >
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      </div>

      {/* Family Selector */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {families.map((family) => {
          const config = THEME_FAMILIES[family];
          const familyScale = generateColorScale(family);
          const isSelected = activeFamily === family;

          return (
            <button
              key={family}
              onClick={() => {
                setActiveFamily(family);
                setHueOffset(0);
              }}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                isSelected
                  ? isDark
                    ? 'border-[#f5f4f2] bg-[#2d2a26]'
                    : 'border-[#1a1815] bg-white'
                  : isDark
                    ? 'border-[#3d3a36] hover:bg-[#242220]'
                    : 'border-transparent hover:bg-black/5'
              )}
            >
              <div
                className="size-8 rounded-full shadow-sm"
                style={{ backgroundColor: oklchToHex(familyScale[9]) }}
              />
              <span
                className={cn('text-sm font-medium', isDark ? 'text-[#f5f4f2]' : 'text-[#1a1815]')}
              >
                {config.name}
              </span>
              {isSelected && (
                <Check
                  className={cn('ml-auto size-4', isDark ? 'text-[#f5f4f2]' : 'text-[#1a1815]')}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Hue Slider */}
      <div
        className={cn(
          'rounded-2xl border p-5',
          isDark ? 'border-[#3d3a36] bg-[#242220]' : 'border-[#e0ddd9] bg-white'
        )}
      >
        <div className="mb-4 flex justify-between">
          <label
            className={cn('text-sm font-medium', isDark ? 'text-[#f5f4f2]' : 'text-[#1a1815]')}
          >
            Hue Offset
          </label>
          <span className="font-mono text-xs opacity-50">
            {hueOffset > 0 ? `+${hueOffset}` : hueOffset}°
          </span>
        </div>
        <input
          type="range"
          min="-15"
          max="15"
          value={hueOffset}
          onChange={(e) => setHueOffset(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
        />
      </div>

      {/* Application Preview */}
      <div
        className="overflow-hidden rounded-2xl border shadow-xl"
        style={{
          backgroundColor: oklchToHex(isDark ? scale[1] : scale[1]), // Background is consistent step 1
          borderColor: oklchToHex(scale[6]),
        }}
      >
        {/* Navbar simulation */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: oklchToHex(scale[6]) }}
        >
          <div className="font-serif text-lg font-bold" style={{ color: oklchToHex(scale[12]) }}>
            Trattoria
          </div>
          <div className="flex gap-4 text-sm font-medium" style={{ color: oklchToHex(scale[11]) }}>
            <span>Menu</span>
            <span>Reservas</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="space-y-6 p-8 text-center md:p-12">
          <h2
            className="font-serif text-4xl font-medium tracking-tight md:text-5xl"
            style={{ color: oklchToHex(scale[12]) }}
          >
            Taste the difference
          </h2>
          <p
            className="mx-auto max-w-md text-lg leading-relaxed"
            style={{ color: oklchToHex(scale[11]) }}
          >
            Auténtica cocina italiana con ingredientes frescos y locales. Experimenta el minimalismo
            cálido.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full px-8 text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: oklchToHex(scale[9]),
                color: '#ffffff', // Force white
              }}
            >
              <ShoppingBag className="mr-2 size-5" />
              Pedir ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-2 px-8 text-base hover:bg-black/5"
              style={{
                borderColor: oklchToHex(scale[7]),
                color: oklchToHex(scale[11]),
              }}
            >
              Ver carta
            </Button>
          </div>
        </div>

        {/* Features Cards */}
        <div
          className="grid gap-1 border-t md:grid-cols-3"
          style={{ borderColor: oklchToHex(scale[6]) }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-6 text-center md:p-8"
              style={{ backgroundColor: i === 2 ? oklchToHex(scale[2]) : 'transparent' }}
            >
              <div
                className="mb-2 flex size-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: oklchToHex(scale[3]), color: oklchToHex(scale[9]) }}
              >
                <Zap className="size-6" />
              </div>
              <h4 className="font-semibold" style={{ color: oklchToHex(scale[12]) }}>
                Rápido
              </h4>
              <p className="text-sm" style={{ color: oklchToHex(scale[11]) }}>
                Servicio veloz sin perder calidad.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
