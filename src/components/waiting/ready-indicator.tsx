'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ReadyIndicatorProps {
  /** Number of ready participants */
  readyCount: number;
  /** Total number of participants */
  totalCount: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ReadyIndicator - Visual progress showing how many are ready
 *
 * Circular progress indicator with animated fill.
 */
export function ReadyIndicator({ readyCount, totalCount, className }: ReadyIndicatorProps) {
  const progress = totalCount > 0 ? readyCount / totalCount : 0;
  const allReady = readyCount === totalCount && totalCount > 0;

  // Circle dimensions
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Background circle */}
      <svg width={size} height={size} className="rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={allReady ? 'text-success' : 'text-primary'}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        {allReady ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Check className="text-success size-10" strokeWidth={3} />
          </motion.div>
        ) : (
          <>
            <span className="text-3xl font-bold tabular-nums">
              {readyCount}/{totalCount}
            </span>
            <span className="text-muted-foreground text-xs">listos</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
