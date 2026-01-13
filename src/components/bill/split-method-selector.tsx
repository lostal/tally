'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { List, Calculator, Wallet } from 'lucide-react';

type SplitMethod = 'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL';

interface SplitMethodSelectorProps {
  /** Currently selected method */
  value: SplitMethod;
  /** Callback when method changes */
  onChange: (method: SplitMethod) => void;
  /** Number of participants (for equal split) */
  participantCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Disable split by items (Essential Plan) */
  disableSplitByItems?: boolean;
}

const SPLIT_OPTIONS: {
  value: SplitMethod;
  label: string;
  description: string;
  icon: typeof List;
}[] = [
  {
    value: 'EQUAL',
    label: 'Pagar todo',
    description: 'Pago completo de la cuenta',
    icon: Wallet,
  },
  {
    value: 'BY_ITEMS',
    label: 'Por productos',
    description: 'Selecciona lo que pediste',
    icon: List,
  },
  {
    value: 'BY_AMOUNT',
    label: 'Cantidad fija',
    description: 'Introduce un importe',
    icon: Calculator,
  },
];

/**
 * SplitMethodSelector - Choose how to split the bill
 */
export function SplitMethodSelector({
  value,
  onChange,
  participantCount,
  className,
  disableSplitByItems = false,
}: SplitMethodSelectorProps) {
  // Filter options based on restrictions
  const visibleOptions = SPLIT_OPTIONS.filter(
    (opt) => !(opt.value === 'BY_ITEMS' && disableSplitByItems)
  );

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        ¿Cómo quieres dividir?
      </h2>

      <div className="grid gap-3">
        {visibleOptions.map((option, index) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-accent border-border'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl transition-colors',
                  isSelected ? 'bg-primary-foreground/20' : 'bg-secondary'
                )}
              >
                <Icon className="size-6" />
              </div>

              <div className="flex-1">
                <div className="font-semibold">{option.label}</div>
                <div
                  className={cn(
                    'text-sm',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {option.description}
                  {option.value === 'EQUAL' && participantCount && participantCount > 1 && (
                    <> · {participantCount} personas</>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              <motion.div
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary-foreground bg-primary-foreground' : 'border-border'
                )}
                animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              >
                {isSelected && (
                  <motion.div
                    className="bg-primary size-3 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
