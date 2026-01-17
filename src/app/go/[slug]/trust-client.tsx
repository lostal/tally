'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { TrustCardPremium, PoweredByBadge } from '@/components/trust/trust-card-premium';
import { logger } from '@/lib/logger';
import { useUIStore } from '@/stores';

interface TrustPageClientProps {
  slug: string;
  restaurantName: string;
  logoUrl: string | null;
  tableNumber: string;
  isVerified: boolean;
}

/**
 * Trust Screen Client Component
 *
 * The first touchpoint with customers. Every detail matters here.
 * Premium animations create trust and delight from the first second.
 */
export function TrustPageClient({
  slug,
  restaurantName,
  logoUrl,
  tableNumber,
  isVerified,
}: TrustPageClientProps) {
  const router = useRouter();
  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleContinue = async () => {
    setIsLoading(true);

    // Create session via API
    try {
      const response = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          tableNumber,
        }),
      });

      if (!response.ok) {
        logger.error('Failed to create session');
      }
    } catch (error) {
      logger.error('Session creation error:', error);
    }

    setCurrentStep('bill');
    router.push(`/${slug}/bill?table=${tableNumber}`);
  };

  React.useEffect(() => {
    setCurrentStep('trust');
  }, [setCurrentStep]);

  return (
    <main className="bg-background relative min-h-dvh overflow-hidden">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="from-primary/2 absolute inset-0 bg-linear-to-b via-transparent to-transparent" />
        <div className="bg-primary/3 absolute top-0 left-1/2 size-150 -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="container-app relative flex min-h-dvh flex-col justify-between py-12">
        {/* Top: Powered by */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PoweredByBadge />
        </motion.div>

        {/* Center: Trust Card */}
        <div className="flex flex-1 items-center justify-center py-8">
          <TrustCardPremium
            restaurant={{
              name: restaurantName,
              logoUrl: logoUrl || undefined,
              isVerified: isVerified,
            }}
            table={{
              number: tableNumber,
            }}
            onContinue={handleContinue}
            isLoading={isLoading}
          />
        </div>

        {/* Bottom: Decorative element */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="bg-muted-foreground/30 size-1.5 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
