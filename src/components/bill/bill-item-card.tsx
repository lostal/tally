'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface BillItemCardProps {
  /** Item ID */
  id: string;
  /** Item name */
  name: string;
  /** Price in cents */
  priceCents: number;
  /** Quantity ordered */
  quantity: number;
  /** Whether this item is selected by current user */
  isSelected: boolean;
  /** How many of this item the user is claiming */
  claimedQuantity: number;
  /** Callback when selection changes */
  onToggle: () => void;
  /** Callback when quantity changes (for partial claims) */
  onQuantityChange?: (quantity: number) => void;
  /** Whether item is fully claimed by others */
  isFullyClaimed?: boolean;
  /** Index for staggered animation */
  index?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BillItemCard - Selectable item on the bill
 *
 * Users tap to select items they want to pay for.
 * Shows visual feedback for selection state.
 */
export function BillItemCard({
  name,
  priceCents,
  quantity,
  isSelected,
  claimedQuantity,
  onToggle,
  onQuantityChange,
  isFullyClaimed = false,
  index = 0,
  className,
}: BillItemCardProps) {
  const totalPriceCents = priceCents * (isSelected ? claimedQuantity : quantity);
  const canInteract = !isFullyClaimed || isSelected;

  return (
    <motion.div
      role="button"
      tabIndex={canInteract ? 0 : -1}
      onClick={canInteract ? onToggle : undefined}
      onKeyDown={
        canInteract
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onToggle();
            }
          : undefined
      }
      aria-disabled={!canInteract}
      className={cn(
        'w-full rounded-2xl p-4 text-left transition-colors',
        canInteract ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
        isSelected ? 'bg-primary/5 ring-primary ring-2' : 'bg-card hover:bg-accent',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      whileTap={canInteract ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Item name and quantity */}
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{name}</span>
            {quantity > 1 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                ×{quantity}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="mt-1.5">
            <CurrencyDisplay amountCents={totalPriceCents} size="lg" animated={false} />
          </div>
        </div>

        {/* Selection indicator */}
        <motion.div
          className={cn(
            'flex size-7 items-center justify-center rounded-full border-2 transition-colors',
            isSelected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background'
          )}
          animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {isSelected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="size-4" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Quantity selector for partial claims (when quantity > 1 and selected) */}
      {isSelected && quantity > 1 && onQuantityChange && (
        <motion.div
          className="mt-3 flex items-center gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <span className="text-muted-foreground text-xs">Claiming:</span>
          <div className="flex gap-1">
            {Array.from({ length: quantity }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(num);
                }}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  claimedQuantity === num
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
