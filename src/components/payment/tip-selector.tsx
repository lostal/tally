'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TipSelectorProps {
  /** Available tip percentages */
  options?: number[];
  /** Currently selected percentage */
  value: number;
  /** Callback when tip changes */
  onChange: (percent: number) => void;
  /** Subtotal in cents (to show tip amount) */
  subtotalCents?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TipSelector - Animated tip percentage selector
 *
 * Shows percentage buttons with optional amount preview.
 * Includes "No tip" option.
 */
export function TipSelector({
  options = [0, 10, 15, 20],
  value,
  onChange,
  subtotalCents,
  className,
}: TipSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Añadir propina
      </h2>

      <div className="grid grid-cols-4 gap-2">
        {options.map((percent, index) => {
          const isSelected = value === percent;
          const tipAmount = subtotalCents ? Math.round((subtotalCents * percent) / 100) : null;

          return (
            <motion.div
              key={percent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={isSelected ? 'default' : 'outline'}
                size="lg"
                onClick={() => onChange(percent)}
                className={cn(
                  'h-auto w-full flex-col rounded-xl py-3',
                  isSelected && 'ring-primary ring-2 ring-offset-2'
                )}
              >
                <span className="text-lg font-bold">
                  {percent === 0 ? 'Sin propina' : `${percent}%`}
                </span>
                {tipAmount !== null && tipAmount > 0 && (
                  <span
                    className={cn(
                      'mt-0.5 text-xs',
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}
                  >
                    €{(tipAmount / 100).toFixed(2)}
                  </span>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
