'use client';

import { AnimatedNumber } from './animated-number';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  /** Amount in cents (to avoid floating point issues) */
  amountCents: number;
  /** Currency code */
  currency?: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Whether to animate changes */
  animated?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Show positive sign for positive amounts */
  showPositiveSign?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  CHF: 'CHF',
  GBP: '£',
  USD: '$',
};

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-3xl font-bold',
};

/**
 * CurrencyDisplay - Formatted currency display with optional animation
 *
 * Uses cents internally to avoid floating point precision issues.
 * Supports EUR, CHF, GBP, and USD currencies.
 */
export function CurrencyDisplay({
  amountCents,
  currency = 'EUR',
  animated = true,
  size = 'md',
  className,
  showPositiveSign = false,
}: CurrencyDisplayProps) {
  const amount = amountCents / 100;
  const symbol = CURRENCY_SYMBOLS[currency];
  const isPositive = amount > 0;

  // For European format: € before amount
  const euroFormat = currency === 'EUR' || currency === 'GBP';

  const formattedValue = animated ? (
    <AnimatedNumber
      value={Math.abs(amount)}
      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
    />
  ) : (
    Math.abs(amount).toFixed(2)
  );

  return (
    <span className={cn('tabular-nums', SIZE_CLASSES[size], className)}>
      {amount < 0 && '-'}
      {showPositiveSign && isPositive && '+'}
      {euroFormat && symbol}
      {formattedValue}
      {!euroFormat && ` ${symbol}`}
    </span>
  );
}
