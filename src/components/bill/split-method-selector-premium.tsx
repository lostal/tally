'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Wallet, Calculator, ListChecks, Users, Check } from 'lucide-react';
import { springSmooth, springSnappy } from '@/lib/motion';

type SplitMethod = 'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL' | 'DYNAMIC_EQUAL';

interface SplitMethodSelectorProps {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
  participantCount?: number;
  className?: string;
  disableSplitByItems?: boolean;
}

interface OptionConfig {
  value: SplitMethod;
  label: string;
  description: string;
  icon: typeof Wallet;
}

const SPLIT_OPTIONS: OptionConfig[] = [
  {
    value: 'EQUAL',
    label: 'Pagar todo',
    description: 'Pago completo',
    icon: Wallet,
  },
  {
    value: 'DYNAMIC_EQUAL',
    label: 'Dividir entre personas',
    description: 'División automática',
    icon: Users,
  },
  {
    value: 'BY_ITEMS',
    label: 'Por productos',
    description: 'Lo que pediste',
    icon: ListChecks,
  },
  {
    value: 'BY_AMOUNT',
    label: 'Cantidad fija',
    description: 'Importe exacto',
    icon: Calculator,
  },
];

/**
 * SplitMethodSelectorPremium - Elevated split method selection
 *
 * Features:
 * - Smooth selection transitions
 * - Icon animations on selection
 * - Staggered entrance
 * - Premium hover states
 */
export function SplitMethodSelectorPremium({
  value,
  onChange,
  participantCount,
  className,
  disableSplitByItems = false,
}: SplitMethodSelectorProps) {
  const visibleOptions = SPLIT_OPTIONS.filter(
    (opt) => !(opt.value === 'BY_ITEMS' && disableSplitByItems)
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header */}
      <motion.h2
        className="text-muted-foreground text-xs font-semibold tracking-widest uppercase"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        ¿Cómo quieres pagar?
      </motion.h2>

      {/* Options grid */}
      <div className="grid gap-3">
        {visibleOptions.map((option, index) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex items-center gap-4 p-5',
                'rounded-2xl border-2 text-left',
                'transition-colors duration-200',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05, ...springSmooth }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Icon container */}
              <motion.div
                className={cn(
                  'flex size-14 items-center justify-center rounded-xl',
                  'transition-colors duration-200',
                  isSelected ? 'bg-primary-foreground/15' : 'bg-secondary'
                )}
                animate={isSelected ? { rotate: [0, -5, 5, 0] } : { rotate: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Icon
                  className={cn(
                    'size-6 transition-transform duration-200',
                    isSelected && 'scale-110'
                  )}
                />
              </motion.div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">{option.label}</div>
                <div
                  className={cn(
                    'mt-0.5 text-sm transition-colors duration-200',
                    isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {option.description}
                  {option.value === 'EQUAL' && participantCount && participantCount > 1 && (
                    <span> · {participantCount} personas</span>
                  )}
                  {option.value === 'DYNAMIC_EQUAL' && participantCount && (
                    <span>
                      {' '}
                      · {participantCount} {participantCount === 1 ? 'persona' : 'personas'}
                    </span>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary-foreground bg-primary-foreground'
                    : 'border-border bg-transparent'
                )}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={springSnappy}
                    >
                      <Check className="text-primary size-4" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shine effect on selection */}
              {isSelected && (
                <motion.div
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
