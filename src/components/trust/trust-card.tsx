'use client';

import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RestaurantBadge } from './restaurant-badge';
import { VerifiedIndicator } from './verified-indicator';
import { LocationDisplay } from './location-display';

interface TrustCardProps {
  /** Restaurant information */
  restaurant: {
    name: string;
    logoUrl?: string;
    location?: string;
    isVerified: boolean;
  };
  /** Table information */
  table: {
    number: string;
    guestCount?: number;
  };
  /** Callback when user confirms and continues */
  onContinue: () => void;
  /** Whether the continue action is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TrustCard - The initial screen users see after scanning QR
 *
 * This is the MOST CRITICAL point for user trust. Shows:
 * - Restaurant branding (logo/name)
 * - Verification badge
 * - Table/location confirmation
 * - Clear CTA to continue
 */
export function TrustCard({
  restaurant,
  table,
  onContinue,
  isLoading = false,
  className,
}: TrustCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={cn('overflow-hidden rounded-3xl border-0 shadow-xl', className)}>
        <CardHeader className="space-y-4 pt-8 pb-4">
          {/* Restaurant branding */}
          <div className="flex flex-col items-center text-center">
            <RestaurantBadge name={restaurant.name} logoUrl={restaurant.logoUrl} size="lg" />
            <motion.h1
              className="mt-4 text-2xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {restaurant.name}
            </motion.h1>
            {restaurant.isVerified && (
              <div className="mt-2">
                <VerifiedIndicator variant="inline" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Table info */}
          <div className="bg-secondary/50 rounded-2xl p-4">
            <LocationDisplay
              restaurantName={restaurant.name}
              tableNumber={table.number}
              guestCount={table.guestCount}
              location={restaurant.location}
            />
          </div>

          {/* Continue CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onContinue}
              disabled={isLoading}
              className="h-14 w-full gap-2 rounded-2xl text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  Continuar al pago
                  <ChevronRight className="size-5" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Trust footer */}
          <p className="text-muted-foreground text-center text-xs">
            Pago seguro con tally.
            <br />A continuación elegirás tus productos.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
