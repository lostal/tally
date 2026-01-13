'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { getClient } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import {
  LoginCard,
  AnimatedLogo,
  AnimatedError,
  PinDisplay,
  PinKeypad,
} from '@/components/shared/login-primitives';

/**
 * POS Login Page - Premium PIN-based login
 */
export default function POSLoginPage() {
  const router = useRouter();
  const [pin, setPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);

      // Auto-submit when complete
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async (pinCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getClient();

      // Demo: use email/password with PIN as password
      // In production, check against users.pin column
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `waiter-${pinCode}@tally.local`,
        password: pinCode,
      });

      if (authError) {
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

  return (
    <LoginCard>
      <AnimatedLogo icon={ChefHat} label="tally POS" sublabel="Introduce tu PIN" />

      <PinDisplay length={4} current={pin.length} error={!!error} />

      <AnimatedError message={error} />

      <PinKeypad
        onDigit={handlePinInput}
        onClear={handleClear}
        onDelete={handleDelete}
        disabled={pin.length >= 4}
        isLoading={isLoading}
      />

      {/* Demo mode button */}
      <motion.button
        type="button"
        onClick={() => router.push('/pos')}
        className="text-muted-foreground hover:text-foreground w-full py-3 text-sm transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Modo demo (sin login)
      </motion.button>
    </LoginCard>
  );
}
