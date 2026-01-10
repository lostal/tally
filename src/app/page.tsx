'use client';

import * as React from 'react';
import NumberFlow from '@number-flow/react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useTheme, DEMO_RESTAURANTS } from '@/components/providers/theme-provider';
import {
  Check,
  CreditCard,
  Users,
  Utensils,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

// Demo bill item
interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
}

const DEMO_ITEMS: BillItem[] = [
  { id: '1', name: 'Margherita Pizza', price: 14.5, quantity: 1, selected: false },
  { id: '2', name: 'Pasta Carbonara', price: 16.0, quantity: 1, selected: false },
  { id: '3', name: 'Tiramisu', price: 8.5, quantity: 2, selected: false },
  { id: '4', name: 'Sparkling Water', price: 4.0, quantity: 2, selected: true },
  { id: '5', name: 'Espresso', price: 3.0, quantity: 2, selected: true },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
} as const;

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const themes = Object.values(DEMO_RESTAURANTS);

  return (
    <div className="flex flex-wrap gap-3">
      {themes.map((t) => (
        <motion.div key={t.slug} whileTap={{ scale: 0.95 }}>
          <Button
            variant={theme.slug === t.slug ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme(t)}
            className="rounded-full px-4"
          >
            {t.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  const toggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.button
      onClick={toggle}
      className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-full"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="size-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="size-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function BillItemCard({
  item,
  onToggle,
  index,
}: {
  item: BillItem;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={`w-full rounded-2xl border-2 p-5 text-left transition-colors ${
        item.selected
          ? 'border-primary bg-primary/5'
          : 'bg-card hover:border-border border-transparent'
      }`}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{item.name}</span>
            {item.quantity > 1 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                ×{item.quantity}
              </Badge>
            )}
          </div>
          <div className="text-foreground mt-2 text-lg font-semibold tabular-nums">
            €{(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
        <motion.div
          className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors ${
            item.selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background'
          }`}
          animate={item.selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {item.selected && <Check className="size-4" strokeWidth={3} />}
        </motion.div>
      </div>
    </motion.button>
  );
}

function TipButton({
  percent,
  isActive,
  onClick,
}: {
  percent: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="lg"
        onClick={onClick}
        className="w-full rounded-xl text-base font-medium"
      >
        {percent === 0 ? 'No tip' : `${percent}%`}
      </Button>
    </motion.div>
  );
}

export default function DemoPage() {
  const { theme } = useTheme();
  const [items, setItems] = React.useState(DEMO_ITEMS);
  const [tipPercent, setTipPercent] = React.useState(10);

  const selectedTotal = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const tipAmount = (selectedTotal * tipPercent) / 100;
  const grandTotal = selectedTotal + tipAmount;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  return (
    <main className="bg-background min-h-dvh">
      {/* Header - Glassmorphism */}
      <header className="glass border-border/50 sticky top-0 z-50 border-b">
        <div className="container-app py-5">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <h1 className="text-2xl font-bold tracking-tight">tally.</h1>
              <p className="text-muted-foreground text-sm">Design System</p>
            </motion.div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                {theme.name}
              </Badge>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="container-app space-y-10 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Theme Selector */}
        <motion.section className="space-y-4" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Restaurant Theme
            </h2>
          </div>
          <ThemeSelector />
        </motion.section>

        {/* Trust Badge - More generous spacing */}
        <motion.section variants={itemVariants}>
          <Card className="shadow-foreground/5 overflow-hidden rounded-3xl border-0 shadow-lg">
            <CardHeader className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
                  <Utensils className="text-primary size-7" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{theme.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <span className="bg-success/20 flex size-5 items-center justify-center rounded-full">
                      <Check className="text-success size-3" />
                    </span>
                    <span>Verified restaurant</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Table 7 • 2 guests</span>
                <Badge variant="secondary" className="gap-1.5 rounded-full">
                  <Users className="size-3.5" />
                  <span>Shared bill</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Bill Items - More padding */}
        <motion.section className="space-y-5" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Select your items
            </h2>
            <span className="text-muted-foreground text-sm">
              {items.filter((i) => i.selected).length}/{items.length}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <BillItemCard
                key={item.id}
                item={item}
                index={index}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </motion.section>

        {/* Tip Selector - Grid with more space */}
        <motion.section className="space-y-5" variants={itemVariants}>
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Add a tip
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[0, 10, 15, 20].map((percent) => (
              <TipButton
                key={percent}
                percent={percent}
                isActive={tipPercent === percent}
                onClick={() => setTipPercent(percent)}
              />
            ))}
          </div>
        </motion.section>

        {/* Total with Animated Numbers */}
        <motion.section variants={itemVariants}>
          <Card className="rounded-3xl shadow-lg">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  €<NumberFlow value={selectedTotal} format={{ minimumFractionDigits: 2 }} />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tip ({tipPercent}%)</span>
                <span className="font-medium tabular-nums">
                  €<NumberFlow value={tipAmount} format={{ minimumFractionDigits: 2 }} />
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-primary text-3xl font-bold tabular-nums">
                  €<NumberFlow value={grandTotal} format={{ minimumFractionDigits: 2 }} />
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Pay Button - Full width, prominent */}
        <motion.section className="pb-6" variants={itemVariants}>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button className="h-16 w-full gap-3 rounded-2xl text-lg font-semibold" size="lg">
              <CreditCard className="size-6" />
              Pay €{grandTotal.toFixed(2)}
              <ChevronRight className="ml-auto size-5" />
            </Button>
          </motion.div>
          <p className="text-muted-foreground mt-4 text-center text-xs">
            Secure payment powered by Stripe
          </p>
        </motion.section>

        <Separator />

        {/* Component Showcase */}
        <motion.section className="space-y-6" variants={itemVariants}>
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            UI Components
          </h2>

          <div className="space-y-6">
            {/* Buttons */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Buttons</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="rounded-xl">Primary</Button>
                <Button variant="secondary" className="rounded-xl">
                  Secondary
                </Button>
                <Button variant="outline" className="rounded-xl">
                  Outline
                </Button>
                <Button variant="ghost" className="rounded-xl">
                  Ghost
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge className="rounded-full">Default</Badge>
                <Badge variant="secondary" className="rounded-full">
                  Secondary
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  Outline
                </Badge>
                <Badge variant="destructive" className="rounded-full">
                  Error
                </Badge>
              </CardContent>
            </Card>

            {/* Input */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter custom amount..." className="rounded-xl" />
                <div className="flex gap-3">
                  <Input placeholder="€" className="w-24 rounded-xl text-center tabular-nums" />
                  <Button className="flex-1 rounded-xl">Split equally</Button>
                </div>
              </CardContent>
            </Card>

            {/* Skeleton */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-12 text-center">
          <p className="text-muted-foreground text-sm">tally. — Pay your bill, your way</p>
          <p className="text-muted-foreground/60 mt-1 text-xs">© 2025 — Portfolio Project</p>
        </footer>
      </motion.div>
    </main>
  );
}
