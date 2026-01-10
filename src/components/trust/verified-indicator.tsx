'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Check, Shield } from 'lucide-react';

interface VerifiedIndicatorProps {
  /** Style variant */
  variant?: 'badge' | 'inline' | 'shield';
  /** Additional CSS classes */
  className?: string;
}

/**
 * VerifiedIndicator - Trust badge showing restaurant is verified
 *
 * Critical for user trust - shows that this is a legitimate restaurant
 * and not a scam. Animated entrance draws attention.
 */
export function VerifiedIndicator({ variant = 'badge', className }: VerifiedIndicatorProps) {
  if (variant === 'inline') {
    return (
      <motion.span
        className={cn('inline-flex items-center gap-1.5 text-sm', className)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="bg-success/20 flex size-5 items-center justify-center rounded-full">
          <Check className="text-success size-3" strokeWidth={3} />
        </span>
        <span className="text-muted-foreground">Verified restaurant</span>
      </motion.span>
    );
  }

  if (variant === 'shield') {
    return (
      <motion.div
        className={cn('bg-success/10 flex items-center gap-2 rounded-full px-3 py-1.5', className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Shield className="text-success size-4" />
        <span className="text-success text-xs font-medium">Verified</span>
      </motion.div>
    );
  }

  // Default: badge variant
  return (
    <motion.div
      className={cn(
        'bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </motion.span>
      Verified
    </motion.div>
  );
}
