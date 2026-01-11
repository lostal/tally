import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Users, Utensils, Trash2, QrCode, ChefHat } from 'lucide-react';

/**
 * Theme System Showcase
 *
 * Designed to verify the 'Warm Minimalism' aesthetic in a vertical,
 * mobile-first context (typical for POS/Phone usage).
 */

export default function ThemeShowcasePage() {
  return (
    <main className="bg-background min-h-dvh">
      {/* Header */}
      <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container-app flex items-center justify-between py-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold">tally.</h1>
            <p className="text-muted-foreground text-xs">Design System</p>
          </div>
        </div>
      </header>

      <div className="container-app mx-auto max-w-2xl space-y-20 py-12">
        {/* Section: Typography & Colors */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl">Typography & Color</h2>
            <p className="text-muted-foreground">The foundation of Warm Minimalism.</p>
          </div>

          <Card className="overflow-hidden border-2">
            <div className="grid h-32 grid-cols-4">
              <div className="bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                Primary
              </div>
              <div className="bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">
                Secondary
              </div>
              <div className="bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                Muted
              </div>
              <div className="bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium">
                Accent
              </div>
            </div>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2">
                <h1 className="font-serif text-4xl">Heading Display</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The quick brown fox jumps over the lazy dog. Utilizing{' '}
                  <span className="text-foreground font-medium">Inter</span> for UI elements and{' '}
                  <span className="text-foreground font-serif italic">Lora</span> for headings.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: Interactive Atoms */}
        <section className="space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl">Interactive Atoms</h2>
            <p className="text-muted-foreground">Base components designed for touch.</p>
          </div>

          <div className="grid gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Inputs
              </h3>
              <Input
                className="h-12 rounded-xl border-2 text-base"
                placeholder="Standard Input..."
              />
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 font-serif text-lg">
                  €
                </span>
                <Input
                  className="h-12 rounded-xl border-2 pl-10 text-lg font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4 pt-4">
              <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Buttons
              </h3>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="h-12 w-full rounded-xl text-base shadow-md">
                  Primary Action
                </Button>
                <Button size="lg" variant="secondary" className="h-12 w-full rounded-xl text-base">
                  Secondary Action
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 rounded-xl border-2">
                    Back
                  </Button>
                  <Button variant="ghost" className="hover:bg-muted h-12 rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Application Patterns (The Real Deal) */}
        <section className="border-border space-y-10 border-t pt-12">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl">Application Patterns</h2>
            <p className="text-muted-foreground text-lg">
              Actual components used in production contexts.
            </p>
          </div>

          {/* Pattern 1: Table Card */}
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">Admin: Table Status Card</h3>
            <div className="border-primary bg-primary text-primary-foreground rounded-2xl border-2 p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-3xl">Mesa 7</h3>
                  <div className="text-primary-foreground/90 mt-2 flex items-center gap-2">
                    <Users className="size-5" />
                    <span className="text-base">4 personas</span>
                  </div>
                </div>
                <div className="flex size-4 items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex size-3 rounded-full bg-amber-400 shadow-sm"></span>
                </div>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
                  Ocupada · 45 min
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary flex-1 rounded-xl bg-white font-medium hover:bg-white/90"
                >
                  <QrCode className="mr-2 size-5" /> Ver QR
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-12 rounded-xl border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pattern 2: Bill Splitter */}
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">
              POS: Split Method Selector
            </h3>
            <div className="bg-muted/30 border-border/50 space-y-4 rounded-3xl border-2 p-6">
              {/* Item 1: Selected */}
              <button className="group relative w-full">
                <div className="bg-primary/5 absolute inset-0 translate-y-1 transform rounded-2xl transition-transform group-active:translate-y-0" />
                <div className="border-primary bg-primary text-primary-foreground relative flex items-center gap-4 rounded-2xl border-2 p-5 text-left shadow-lg transition-all">
                  <div className="bg-primary-foreground/20 text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <Utensils className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold">Por productos</div>
                    <div className="text-primary-foreground/80 text-sm">Cada uno paga lo suyo</div>
                  </div>
                  <div className="border-primary-foreground bg-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full border-2">
                    <div className="bg-primary size-3 rounded-full" />
                  </div>
                </div>
              </button>

              {/* Item 2: Unselected */}
              <button className="group relative w-full">
                <div className="border-border bg-card hover:bg-accent hover:border-primary/20 relative flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all">
                  <div className="bg-secondary text-secondary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <Users className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground text-lg font-semibold">Pagar todo</div>
                    <div className="text-muted-foreground text-sm">Una persona paga todo</div>
                  </div>
                  <div className="border-border flex size-6 shrink-0 items-center justify-center rounded-full border-2 opacity-50" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-border space-y-2 border-t pt-12 pb-20 text-center">
          <ChefHat className="text-muted-foreground mx-auto mb-4 size-8" />
          <p className="text-muted-foreground font-medium">tally.</p>
          <p className="text-muted-foreground/60 text-xs">System Status: Stable</p>
        </footer>
      </div>
    </main>
  );
}
