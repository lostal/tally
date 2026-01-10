'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface PaymentSummaryProps {
  /** Subtotal in cents */
  subtotalCents: number;
  /** Tip amount in cents */
  tipCents: number;
  /** Tip percentage for display */
  tipPercentage: number;
  /** Total in cents */
  totalCents: number;
  /** Currency */
  currency?: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Additional CSS classes */
  className?: string;
}

/**
 * PaymentSummary - Final payment breakdown card
 *
 * Shows subtotal, tip, and grand total with animated numbers.
 */
export function PaymentSummary({
  subtotalCents,
  tipCents,
  tipPercentage,
  totalCents,
  currency = 'EUR',
  className,
}: PaymentSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={cn('rounded-3xl shadow-lg', className)}>
        <CardContent className="space-y-4 p-6">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <CurrencyDisplay
              amountCents={subtotalCents}
              currency={currency}
              className="font-medium"
            />
          </div>

          {/* Tip */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Propina {tipPercentage > 0 && `(${tipPercentage}%)`}
            </span>
            <CurrencyDisplay amountCents={tipCents} currency={currency} className="font-medium" />
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-semibold">Total</span>
            <CurrencyDisplay
              amountCents={totalCents}
              currency={currency}
              size="xl"
              className="text-primary"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
