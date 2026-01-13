'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { springSmooth, springSnappy } from '@/lib/motion';

interface TipSelectorPremiumProps {
  options?: number[];
  value: number;
  onChange: (percent: number) => void;
  subtotalCents?: number;
  className?: string;
}

/**
 * TipSelectorPremium - Elevated tip selection with premium animations
 *
 * Features:
 * - Animated amount previews
 * - Selection pulse effect
 * - Smooth value transitions
 */
export function TipSelectorPremium({
  options = [0, 10, 15, 20],
  value,
  onChange,
  subtotalCents,
  className,
}: TipSelectorPremiumProps) {
  const formatCurrency = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Añadir propina
        </h2>
        {subtotalCents && value > 0 && (
          <motion.span
            key={value}
            className="text-primary text-sm font-medium"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springSnappy}
          >
            +{formatCurrency(Math.round((subtotalCents * value) / 100))}
          </motion.span>
        )}
      </motion.div>

      {/* Options grid */}
      <div className="grid grid-cols-4 gap-2">
        {options.map((percent, index) => {
          const isSelected = value === percent;
          const tipAmount = subtotalCents ? Math.round((subtotalCents * percent) / 100) : null;

          return (
            <motion.button
              key={percent}
              onClick={() => onChange(percent)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'h-20 rounded-xl border-2',
                'transition-colors duration-200',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-primary/20 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05, ...springSmooth }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Percentage */}
              <motion.span
                className="text-xl font-bold"
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {percent === 0 ? 'No' : `${percent}%`}
              </motion.span>

              {/* Amount preview */}
              {tipAmount !== null && percent > 0 && (
                <motion.span
                  className={cn(
                    'mt-1 text-xs transition-colors',
                    isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  {formatCurrency(tipAmount)}
                </motion.span>
              )}

              {/* Selection ring pulse */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="border-primary absolute inset-0 rounded-xl border-2"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.1, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
