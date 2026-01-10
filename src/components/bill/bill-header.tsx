'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { RestaurantBadge } from '@/components/trust/restaurant-badge';
import { VerifiedIndicator } from '@/components/trust/verified-indicator';

interface BillHeaderProps {
  /** Restaurant information */
  restaurant: {
    name: string;
    logoUrl?: string;
    isVerified?: boolean;
  };
  /** Table number */
  tableNumber: string;
  /** Number of guests/participants */
  participantCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BillHeader - Header section of the bill view
 *
 * Shows restaurant branding and table info in a compact format.
 */
export function BillHeader({ restaurant, tableNumber, className }: BillHeaderProps) {
  return (
    <motion.div
      className={cn('flex items-center gap-4', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <RestaurantBadge name={restaurant.name} logoUrl={restaurant.logoUrl} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate font-semibold">{restaurant.name}</h1>
          {restaurant.isVerified && <VerifiedIndicator variant="badge" />}
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <span>Mesa {tableNumber}</span>
        </div>
      </div>
    </motion.div>
  );
}
