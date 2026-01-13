'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { springSmooth } from '@/lib/motion';

interface PaymentSummaryPremiumProps {
  subtotalCents: number;
  tipCents: number;
  tipPercentage: number;
  totalCents: number;
  currency?: string;
  className?: string;
}

/**
 * AnimatedCurrency - Smoothly animated currency display
 */
function AnimatedCurrency({
  value,
  currency = '€',
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => `${currency}${(v / 100).toFixed(2)}`);
  const [displayValue, setDisplayValue] = React.useState(`${currency}${(value / 100).toFixed(2)}`);

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  React.useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return unsubscribe;
  }, [display]);

  return <motion.span className={cn('tabular-nums', className)}>{displayValue}</motion.span>;
}

/**
 * PaymentSummaryPremium - Elevated payment breakdown
 *
 * Features:
 * - Animated number transitions
 * - Subtle entrance animations
 * - Clear visual hierarchy
 */
export function PaymentSummaryPremium({
  subtotalCents,
  tipCents,
  tipPercentage,
  totalCents,
  currency = '€',
  className,
}: PaymentSummaryPremiumProps) {
  return (
    <motion.div
      className={cn('bg-card border-border space-y-4 rounded-2xl border-2 p-5', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSmooth}
    >
      {/* Subtotal */}
      <motion.div
        className="flex items-center justify-between text-sm"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-muted-foreground">Subtotal</span>
        <AnimatedCurrency value={subtotalCents} currency={currency} className="font-medium" />
      </motion.div>

      {/* Tip */}
      <motion.div
        className="flex items-center justify-between text-sm"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        <span className="text-muted-foreground">
          Propina
          {tipPercentage > 0 && <span className="ml-1 text-xs opacity-70">({tipPercentage}%)</span>}
        </span>
        <AnimatedCurrency value={tipCents} currency={currency} className="font-medium" />
      </motion.div>

      {/* Divider */}
      <motion.div
        className="bg-border h-px"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />

      {/* Total */}
      <motion.div
        className="flex items-center justify-between pt-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <span className="text-lg font-semibold">Total</span>
        <AnimatedCurrency
          value={totalCents}
          currency={currency}
          className="text-primary font-serif text-2xl font-bold"
        />
      </motion.div>
    </motion.div>
  );
}
