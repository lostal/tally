'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { getClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * POS Login Page - PIN-based login for waiters
 */
export default function POSLoginPage() {
  const router = useRouter();
  const [pin, setPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Auto-submit when PIN is complete
  React.useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getClient();

      // For demo, we'll use email/password with PIN as password
      // In production, this would check against users.pin column
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `waiter-${pin}@tally.local`,
        password: pin,
      });

      if (authError) {
        // Demo fallback: just proceed for now
        // TODO: Implement proper PIN auth
        setError('PIN incorrecto');
        setPin('');
        setIsLoading(false);
        return;
      }

      router.push('/pos');
      router.refresh();
    } catch {
      setError('Error al iniciar sesión');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <motion.div
        className="bg-card w-full max-w-sm space-y-8 rounded-2xl border-2 p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl">
            <ChefHat className="text-primary size-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold">tally POS</h1>
          <p className="text-muted-foreground mt-2">Introduce tu PIN</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'size-4 rounded-full transition-colors',
                pin.length > i ? 'bg-primary' : 'bg-muted'
              )}
              animate={pin.length > i ? { scale: [1, 1.2, 1] } : {}}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.p
            className="text-destructive text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((digit) => (
            <Button
              key={digit}
              variant={digit === 'C' || digit === '⌫' ? 'outline' : 'secondary'}
              className="h-16 rounded-xl text-xl font-semibold"
              onClick={() => {
                if (digit === 'C') handleClear();
                else if (digit === '⌫') handleDelete();
                else handlePinInput(digit);
              }}
              disabled={isLoading}
            >
              {isLoading && digit === '⌫' ? <Loader2 className="size-5 animate-spin" /> : digit}
            </Button>
          ))}
        </div>

        {/* Skip for demo */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            router.push('/pos');
          }}
        >
          Modo demo (sin login)
        </Button>
      </motion.div>
    </div>
  );
}
