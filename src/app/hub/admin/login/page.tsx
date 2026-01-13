'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getClient } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import {
  LoginCard,
  AnimatedLogo,
  AnimatedInput,
  AnimatedSubmitButton,
  AnimatedError,
} from '@/components/shared/login-primitives';

/**
 * Admin Login Page - Premium
 *
 * Email/password login with premium animations
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Credenciales incorrectas');
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginCard>
      <AnimatedLogo
        icon={ChefHat}
        label="Panel de Administración"
        sublabel="Gestiona tu restaurante"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatedInput
          id="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={setEmail}
          required
          autoFocus
        />

        <AnimatedInput
          id="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          required
        />

        <AnimatedError message={error} />

        <AnimatedSubmitButton isLoading={isLoading} loadingText="Iniciando sesión...">
          Iniciar sesión
        </AnimatedSubmitButton>
      </form>

      <p className="text-muted-foreground text-center text-xs">
        Contacta con soporte si no tienes acceso
      </p>
    </LoginCard>
  );
}
