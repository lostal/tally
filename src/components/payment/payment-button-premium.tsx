'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';
import { springSnappy } from '@/lib/motion';

interface PaymentButtonPremiumProps {
  amountCents: number;
  currency?: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * PaymentButtonPremium - Premium CTA button with animated amount
 *
 * Features:
 * - Animated price display
 * - Shine effect on hover
 * - Loading state with spinner
 * - Arrow animation
 */
export function PaymentButtonPremium({
  amountCents,
  currency = '€',
  onClick,
  isLoading = false,
  disabled = false,
  className,
}: PaymentButtonPremiumProps) {
  const x = useMotionValue(0);
  const xSpring = useSpring(x, springSnappy);
  const arrowX = useTransform(xSpring, [0, 1], [0, 4]);

  // Animated price
  const priceSpring = useSpring(amountCents, { stiffness: 100, damping: 20 });
  const [displayPrice, setDisplayPrice] = React.useState(
    `${currency}${(amountCents / 100).toFixed(2)}`
  );

  React.useEffect(() => {
    priceSpring.set(amountCents);
  }, [amountCents, priceSpring]);

  React.useEffect(() => {
    const unsubscribe = priceSpring.on('change', (v) => {
      setDisplayPrice(`${currency}${(v / 100).toFixed(2)}`);
    });
    return unsubscribe;
  }, [priceSpring, currency]);

  const isDisabled = disabled || isLoading || amountCents <= 0;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative w-full overflow-hidden',
        'flex items-center justify-center gap-3',
        'h-16 rounded-2xl',
        'bg-primary text-primary-foreground',
        'text-lg font-semibold',
        'shadow-primary/25 shadow-lg',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'transition-shadow duration-200',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onHoverStart={() => !isDisabled && x.set(1)}
      onHoverEnd={() => x.set(0)}
    >
      {/* Shine effect */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="size-5 animate-spin" />
          <span>Procesando...</span>
        </motion.div>
      ) : (
        <>
          <span>Pagar</span>
          <motion.span className="font-bold tabular-nums" key={amountCents}>
            {displayPrice}
          </motion.span>
          <motion.div style={{ x: arrowX }}>
            <ChevronRight className="size-5" />
          </motion.div>
        </>
      )}

      {/* Pulse ring on valid amount */}
      {!isDisabled && amountCents > 0 && (
        <motion.div
          className="border-primary-foreground/20 absolute inset-0 rounded-2xl border-2"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.02, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  );
}
