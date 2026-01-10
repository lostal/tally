'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { List, Calculator, Users } from 'lucide-react';

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
}

const SPLIT_OPTIONS: {
  value: SplitMethod;
  label: string;
  description: string;
  icon: typeof List;
}[] = [
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
  {
    value: 'EQUAL',
    label: 'A partes iguales',
    description: 'Divide el total entre todos',
    icon: Users,
  },
];

/**
 * SplitMethodSelector - Choose how to split the bill
 *
 * Three options:
 * - BY_ITEMS: Select individual items you ordered
 * - BY_AMOUNT: Enter a fixed amount to pay
 * - EQUAL: Split the total equally among participants
 */
export function SplitMethodSelector({
  value,
  onChange,
  participantCount,
  className,
}: SplitMethodSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        ¿Cómo quieres dividir?
      </h2>

      <div className="grid gap-3">
        {SPLIT_OPTIONS.map((option, index) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex items-center gap-4 rounded-2xl p-4 text-left transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
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
                  {option.value === 'EQUAL' && participantCount && (
                    <> ({participantCount} personas)</>
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
