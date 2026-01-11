'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  /** Table number/name */
  tableNumber: string;
  /** City or location */
  location?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LocationDisplay - Shows table and location information
 *
 * Helps users verify they're at the right table in the right restaurant.
 */
export function LocationDisplay({ tableNumber, location, className }: LocationDisplayProps) {
  return (
    <motion.div
      className={cn('space-y-3', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Restaurant and location */}
      {location && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="size-4" />
          <span>{location}</span>
        </div>
      )}

      {/* Table info */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Mesa {tableNumber}</span>
      </div>
    </motion.div>
  );
}

interface TableBadgeProps {
  /** Table number */
  number: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableBadge - Prominent table number display
 */
export function TableBadge({ number, className }: TableBadgeProps) {
  return (
    <motion.div
      className={cn(
        'bg-secondary inline-flex items-center justify-center rounded-xl px-4 py-2',
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Mesa
      </span>
      <span className="ml-2 text-2xl font-bold tabular-nums">{number}</span>
    </motion.div>
  );
}
