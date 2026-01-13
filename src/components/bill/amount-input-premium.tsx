'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Delete, Banknote } from 'lucide-react';
import { springSmooth, springSnappy } from '@/lib/motion';

interface AmountInputPremiumProps {
  valueCents: number;
  onChange: (cents: number) => void;
  billTotalCents?: number;
  remainingCents?: number;
  className?: string;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]; // in cents

/**
 * AmountInputPremium - Premium keypad-style amount input
 *
 * Features:
 * - Custom keypad design
 * - Animated value display
 * - Quick amount presets
 * - Tactile button feedback
 */
export function AmountInputPremium({
  valueCents,
  onChange,
  billTotalCents: _billTotalCents,
  remainingCents,
  className,
}: AmountInputPremiumProps) {
  const [displayValue, setDisplayValue] = React.useState(
    valueCents > 0 ? (valueCents / 100).toFixed(2) : '0.00'
  );

  // Format for display
  const formatDisplay = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  // Handle digit input
  const handleDigit = (digit: string) => {
    // Remove decimal and leading zeros for calculation
    const currentCents = Math.round(valueCents);
    const newCents = currentCents * 10 + parseInt(digit);

    // Cap at 9999.99 (999999 cents)
    if (newCents <= 999999) {
      onChange(newCents);
      setDisplayValue((newCents / 100).toFixed(2));
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    const newCents = Math.floor(valueCents / 10);
    onChange(newCents);
    setDisplayValue((newCents / 100).toFixed(2));
  };

  // Handle clear
  const handleClear = () => {
    onChange(0);
    setDisplayValue('0.00');
  };

  // Handle quick amount
  const handleQuickAmount = (cents: number) => {
    onChange(cents);
    setDisplayValue((cents / 100).toFixed(2));
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  const isOverpaying = remainingCents !== undefined && valueCents > remainingCents;

  return (
    <motion.div
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSmooth}
    >
      {/* Header */}
      <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Introduce el importe
      </h2>

      {/* Amount display */}
      <motion.div
        className={cn(
          'bg-secondary/50 rounded-2xl border-2 py-6 text-center',
          isOverpaying ? 'border-destructive bg-destructive/5' : 'border-border'
        )}
        layout
      >
        <motion.div
          className={cn(
            'font-serif text-5xl font-bold tabular-nums',
            isOverpaying && 'text-destructive'
          )}
          key={valueCents}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springSnappy}
        >
          €{displayValue}
        </motion.div>

        {/* Remaining indicator */}
        {remainingCents !== undefined && (
          <motion.p
            className="text-muted-foreground mt-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Restante: {formatDisplay(remainingCents)}
          </motion.p>
        )}
      </motion.div>

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((cents, i) => (
          <motion.button
            key={cents}
            onClick={() => handleQuickAmount(cents)}
            className={cn(
              'flex items-center justify-center gap-1.5',
              'border-border bg-card h-11 rounded-xl border-2',
              'text-sm font-medium',
              'hover:border-primary/50 hover:bg-accent/50',
              'transition-colors'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Banknote className="text-muted-foreground size-4" />
            {formatDisplay(cents)}
          </motion.button>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit, index) => {
          const isAction = digit === 'C' || digit === '⌫';

          return (
            <motion.button
              key={digit}
              onClick={() => {
                if (digit === 'C') handleClear();
                else if (digit === '⌫') handleBackspace();
                else handleDigit(digit);
              }}
              className={cn(
                'flex items-center justify-center',
                'h-16 rounded-xl border-2',
                'text-2xl font-semibold',
                'transition-colors',
                isAction
                  ? 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.02 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              {digit === '⌫' ? <Delete className="size-6" /> : digit}
            </motion.button>
          );
        })}
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {isOverpaying && (
          <motion.p
            className="text-destructive text-center text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            El importe supera el total restante
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
