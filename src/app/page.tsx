'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Check,
  CreditCard,
  Users,
  Utensils,
  Moon,
  Sun,
  Trash2,
  Pencil,
  Plus,
  ChevronRight,
} from 'lucide-react';

/**
 * Theme System Showcase
 *
 * This page displays all UI components with the current theme.
 * In the future, restaurant owners will use this to preview their custom theme.
 */

function DarkModeToggle() {
  const { isDark, toggleDark } = useTheme();

  return (
    <motion.button
      onClick={toggleDark}
      className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full"
      whileTap={{ scale: 0.95 }}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </motion.button>
  );
}

export default function ThemeShowcasePage() {
  return (
    <main className="bg-background min-h-dvh">
      {/* Header */}
      <header className="border-border border-b">
        <div className="container-app py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl">tally.</h1>
              <p className="text-muted-foreground mt-1 text-sm">Design System</p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="container-app space-y-12 py-10">
        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Color Palette</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { name: 'Background', var: 'bg-background', text: 'text-foreground' },
              { name: 'Card', var: 'bg-card', text: 'text-card-foreground' },
              { name: 'Primary', var: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', var: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Muted', var: 'bg-muted', text: 'text-muted-foreground' },
              { name: 'Accent', var: 'bg-accent', text: 'text-accent-foreground' },
              { name: 'Destructive', var: 'bg-destructive', text: 'text-white' },
              { name: 'Border', var: 'bg-border', text: 'text-foreground' },
            ].map((color) => (
              <div
                key={color.name}
                className={`${color.var} ${color.text} border-border rounded-2xl border-2 p-4`}
              >
                <span className="text-sm font-medium">{color.name}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
                Heading 1 (Lora)
              </p>
              <h1 className="font-serif">The quick brown fox</h1>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
                Heading 2 (Lora)
              </p>
              <h2 className="font-serif">The quick brown fox</h2>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
                Heading 3 (Inter)
              </p>
              <h3>The quick brown fox</h3>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
                Body (Inter)
              </p>
              <p>
                The quick brown fox jumps over the lazy dog. This is body text at 16px with
                comfortable line height for reading.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="size-4" />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        <Separator />

        {/* Inputs */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Inputs</h2>
          <div className="max-w-sm space-y-4">
            <Input placeholder="Default input..." />
            <Input placeholder="Disabled" disabled />
            <div className="flex gap-3">
              <Input placeholder="€" className="w-24 text-center" />
              <Button className="flex-1">Submit</Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Cards</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-secondary rounded-xl p-2">
                    <Utensils className="size-5" />
                  </div>
                  Restaurant Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This is a card component with header and content sections.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive Card</span>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost">
                      <Pencil className="size-3" />
                    </Button>
                    <Button size="icon-sm" variant="ghost">
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">With action buttons</span>
                  <ChevronRight className="text-muted-foreground size-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* States */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">States</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border-border space-y-2 rounded-2xl border-2 p-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <p className="text-muted-foreground text-xs">Table is free</p>
            </div>
            <div className="border-primary bg-primary text-primary-foreground space-y-2 rounded-2xl border-2 p-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-amber-400" />
                <span className="text-sm font-medium">Occupied</span>
              </div>
              <p className="text-xs opacity-80">Table has active order</p>
            </div>
            <div className="border-border space-y-2 rounded-2xl border-2 p-4">
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                <span className="text-sm font-medium">4 guests</span>
              </div>
              <p className="text-muted-foreground text-xs">Capacity indicator</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl">Loading</h2>
          <div className="max-w-sm space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-border mt-12 border-t py-12 text-center">
          <p className="text-muted-foreground text-sm">tally. — Pay your bill, your way</p>
          <p className="text-muted-foreground/60 mt-1 text-xs">Design System v1.0</p>
        </footer>
      </div>
    </main>
  );
}
