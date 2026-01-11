'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { TrustCard } from '@/components/trust';
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
 * Handles user interaction after data is fetched from server.
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

    // Create session via API (in future: real session creation)
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
        console.error('Failed to create session');
      }
    } catch (error) {
      console.error('Session creation error:', error);
    }

    setCurrentStep('bill');
    router.push(`/${slug}/bill?table=${tableNumber}`);
  };

  React.useEffect(() => {
    setCurrentStep('trust');
  }, [setCurrentStep]);

  return (
    <main className="bg-background min-h-dvh">
      <div className="container-app flex min-h-dvh flex-col justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Logo/Brand */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-muted-foreground text-sm font-medium">powered by</span>
            <h2 className="text-xl font-bold tracking-tight">tally.</h2>
          </motion.div>

          {/* Trust Card */}
          <TrustCard
            restaurant={{
              name: restaurantName,
              isVerified: isVerified,
              logoUrl: logoUrl || undefined,
            }}
            table={{
              number: tableNumber,
            }}
            onContinue={handleContinue}
            isLoading={isLoading}
          />

          {/* Footer */}
          <motion.p
            className="text-muted-foreground text-center text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Al continuar, aceptas nuestros Términos de Servicio
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
