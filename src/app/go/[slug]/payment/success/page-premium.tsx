'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Download, Share2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSmooth, springBouncy } from '@/lib/motion';
import { useParticipantStore } from '@/stores';

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-orange-500',
  ];
  const color = colors[index % colors.length];
  const size = Math.random() * 8 + 4;
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = Math.random() * 2 + 2;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className={cn('absolute rounded-sm', color)}
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: -20,
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 600],
        rotate: [0, rotation, rotation * 2],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

/**
 * SuccessPagePremium - Celebration page after successful payment
 *
 * Features:
 * - Confetti animation
 * - Animated receipt
 * - Share/download options
 */
export default function SuccessPagePremium() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { selectedItemIds, claimedQuantities, tipPercentage, reset } = useParticipantStore();
  const [showConfetti, setShowConfetti] = React.useState(true);

  // Mock data (in production, this comes from API/store)
  const prices: Record<string, { name: string; price: number }> = {
    '1': { name: 'Pizza Margherita', price: 1450 },
    '2': { name: 'Pasta Carbonara', price: 1600 },
    '3': { name: 'Tiramisú', price: 850 },
    '4': { name: 'Agua con gas', price: 400 },
    '5': { name: 'Café expreso', price: 300 },
  };

  const items =
    selectedItemIds.length > 0
      ? selectedItemIds.map((id) => {
          const item = prices[id];
          const qty = claimedQuantities[id] || 1;
          return {
            name: item?.name || 'Producto',
            quantity: qty,
            amountCents: (item?.price || 0) * qty,
          };
        })
      : [{ name: 'Pago completado', quantity: 1, amountCents: 2500 }];

  const subtotalCents = items.reduce((sum, i) => sum + i.amountCents, 0);
  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;

  const receiptNumber = `TLY-${Date.now().toString(36).toUpperCase()}`;
  const paidAt = new Date();

  const handleDone = () => {
    reset();
    router.push(`/${slug}`);
  };

  // Hide confetti after animation
  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-background relative min-h-dvh overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      <div className="container-app py-8">
        {/* Success Header */}
        <motion.div
          className="mb-8 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
        >
          {/* Check icon with glow */}
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...springBouncy, delay: 0.2 }}
          >
            <div className="absolute inset-0 scale-150 rounded-full bg-emerald-500/30 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, ...springBouncy }}
              >
                <Check className="size-10 text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            className="mt-6 font-serif text-3xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            ¡Gracias!
          </motion.h1>

          <motion.p
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Tu pago ha sido procesado correctamente
          </motion.p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          className="bg-card border-border overflow-hidden rounded-2xl border-2 shadow-xl"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, ...springSmooth }}
        >
          {/* Receipt header */}
          <div className="bg-secondary/30 border-border border-b px-6 py-4 text-center">
            <p className="text-muted-foreground text-xs tracking-wider uppercase">Recibo</p>
            <p className="mt-1 font-mono text-sm font-medium">{receiptNumber}</p>
          </div>

          {/* Receipt body */}
          <div className="space-y-4 p-6">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium tabular-nums">
                    €{(item.amountCents / 100).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <motion.div
              className="bg-border h-px"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 }}
            />

            {/* Subtotal & Tip */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">€{(subtotalCents / 100).toFixed(2)}</span>
              </div>
              {tipCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Propina ({tipPercentage}%)</span>
                  <span className="tabular-nums">€{(tipCents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="bg-border h-px" />

            {/* Total */}
            <motion.div
              className="flex items-center justify-between pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-lg font-semibold">Total pagado</span>
              <span className="text-primary font-serif text-2xl font-bold tabular-nums">
                €{(totalCents / 100).toFixed(2)}
              </span>
            </motion.div>

            {/* Timestamp */}
            <motion.p
              className="text-muted-foreground pt-2 text-center text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {paidAt.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </motion.p>
          </div>

          {/* Receipt footer pattern */}
          <div className="h-4 bg-[linear-gradient(135deg,transparent_25%,var(--border)_25%,var(--border)_50%,transparent_50%,transparent_75%,var(--border)_75%)] bg-size-[8px_8px]" />
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-6 flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <button className="border-border bg-card hover:bg-accent flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 transition-colors">
            <Download className="size-4" />
            <span className="text-sm font-medium">Descargar</span>
          </button>
          <button className="border-border bg-card hover:bg-accent flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 transition-colors">
            <Share2 className="size-4" />
            <span className="text-sm font-medium">Compartir</span>
          </button>
        </motion.div>

        {/* Done button */}
        <motion.button
          onClick={handleDone}
          className={cn(
            'mt-6 w-full',
            'flex items-center justify-center gap-2',
            'h-14 rounded-2xl',
            'bg-primary text-primary-foreground',
            'font-semibold',
            'shadow-primary/20 shadow-lg'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Volver al inicio</span>
          <ArrowRight className="size-5" />
        </motion.button>

        {/* Thank you message */}
        <motion.div
          className="text-muted-foreground mt-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Sparkles className="size-4" />
          <span className="text-sm">¡Gracias por usar Tally!</span>
        </motion.div>
      </div>
    </main>
  );
}
