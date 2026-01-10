'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  /** Seconds to count down from */
  seconds: number;
  /** Whether countdown is active */
  isActive: boolean;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CountdownTimer - Animated countdown before payment starts
 *
 * Shows 3-2-1 countdown with dramatic animation.
 */
export function CountdownTimer({
  seconds: initialSeconds,
  isActive,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (!isActive) {
      setSeconds(initialSeconds);
      return;
    }

    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, seconds, initialSeconds, onComplete]);

  if (!isActive) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <motion.p
        className="text-muted-foreground mb-4 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        ¡Todos listos! Empezando en...
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={seconds}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-primary text-primary-foreground flex size-28 items-center justify-center rounded-full"
        >
          <span className="text-6xl font-bold tabular-nums">{seconds || '🚀'}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
