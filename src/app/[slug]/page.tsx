'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { TrustCard } from '@/components/trust';
import { useUIStore } from '@/stores';
// Demo restaurant data (in production would come from API)
const DEMO_RESTAURANT_NAMES: Record<string, string> = {
  'trattoria-mario': 'Trattoria Mario',
  'sushi-zen': 'Sushi Zen',
  'swiss-bistro': 'Swiss Bistro',
  'tally-demo': 'tally Demo',
};

// Demo data - in production this would come from API
const DEMO_TABLES = {
  'trattoria-mario': { number: '7' },
  'sushi-zen': { number: '12' },
  'swiss-bistro': { number: '3' },
  'tally-demo': { number: '1' },
};

/**
 * Restaurant Trust Screen
 *
 * First page users see after scanning QR code.
 * Shows restaurant branding and asks for confirmation.
 */
export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const [isLoading, setIsLoading] = React.useState(false);

  // Get restaurant data (from demo or would be API)
  const restaurantName = DEMO_RESTAURANT_NAMES[slug] || slug;
  const table = DEMO_TABLES[slug as keyof typeof DEMO_TABLES] || DEMO_TABLES['tally-demo'];

  const handleContinue = async () => {
    setIsLoading(true);

    // Simulate API call to create/join session
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCurrentStep('bill');
    router.push(`/${slug}/bill`);
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
              isVerified: true,
            }}
            table={{
              number: table.number,
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
