'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const SIZE_MAP = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

/**
 * LoadingSpinner - Animated loading indicator
 *
 * Uses motion for smooth rotation animation.
 * Matches the primary color from theme.
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn(
        'border-muted border-t-primary rounded-full border-2',
        SIZE_MAP[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-label="Loading"
      role="status"
    />
  );
}

interface LoadingDotsProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * LoadingDots - Three bouncing dots animation
 *
 * More subtle loading indicator for inline use.
 */
export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  );
}
