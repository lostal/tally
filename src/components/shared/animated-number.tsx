'use client';

import NumberFlow, { type NumberFlowProps } from '@number-flow/react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps extends Omit<NumberFlowProps, 'value'> {
  /** The number value to display */
  value: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimatedNumber - Wrapper around NumberFlow for consistent animated number display
 *
 * Uses spring physics for smooth, satisfying number transitions.
 * Perfect for prices, totals, and any dynamic numerical values.
 */
export function AnimatedNumber({ value, className, ...props }: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      className={cn('tabular-nums', className)}
      transformTiming={{ duration: 400, easing: 'ease-out' }}
      spinTiming={{ duration: 400, easing: 'ease-out' }}
      {...props}
    />
  );
}
