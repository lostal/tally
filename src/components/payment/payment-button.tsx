'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { CreditCard, ChevronRight } from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentButtonProps {
  /** Amount to pay in cents */
  amountCents: number;
  /** Currency */
  currency?: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether payment is loading/processing */
  isLoading?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Selected payment method (for styling) */
  paymentMethod?: PaymentMethod;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PaymentButton - Main CTA to complete payment
 *
 * Large, prominent button styled like Apple Pay / payment apps.
 * Shows amount and loading state.
 */
export function PaymentButton({
  amountCents,
  currency = 'EUR',
  onClick,
  isLoading = false,
  disabled = false,
  paymentMethod: _paymentMethod,
  className,
}: PaymentButtonProps) {
  return (
    <motion.div whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}>
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn('h-16 w-full gap-3 rounded-2xl text-lg font-semibold', className)}
        size="lg"
      >
        {isLoading ? (
          <>
            <LoadingSpinner
              size="sm"
              className="border-primary-foreground border-t-primary-foreground/30"
            />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="size-6" />
            Pagar{' '}
            <CurrencyDisplay
              amountCents={amountCents}
              currency={currency}
              animated={false}
              className="font-bold"
            />
            <ChevronRight className="ml-auto size-5" />
          </>
        )}
      </Button>
    </motion.div>
  );
}

interface ApplePayButtonProps {
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ApplePayButton - Apple Pay styled button
 */
export function ApplePayButton({ onClick, disabled = false, className }: ApplePayButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-14 w-full items-center justify-center rounded-xl bg-black text-white transition-opacity',
        disabled && 'opacity-50',
        className
      )}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <svg
        className="h-8"
        viewBox="0 0 165 40"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M150.7 0H14.3C6.4 0 0 6.4 0 14.3v11.4C0 33.6 6.4 40 14.3 40h136.4c7.9 0 14.3-6.4 14.3-14.3V14.3C165 6.4 158.6 0 150.7 0z" />
        <text
          x="82.5"
          y="26"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="500"
        >
          Pay
        </text>
      </svg>
    </motion.button>
  );
}
