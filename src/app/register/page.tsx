'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { getClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

/**
 * Register Page
 *
 * Premium registration experience with organic, minimal aesthetic.
 * Large negative space, smooth animations, warm typography.
 */
export default function RegisterPage() {
  const [step, setStep] = React.useState<'email' | 'details' | 'success'>('email');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Introduce tu email');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Email no válido');
      return;
    }
    setStep('details');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    logger.debug('Starting registration process');

    if (!formData.password || formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getClient();
      logger.debug('Calling Supabase signup');

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          // Redirect to auth callback - always use current origin
          // This URL MUST be whitelisted in Supabase Dashboard → Auth → URL Configuration
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      logger.debug('Supabase signup response received', { hasData: !!data, hasError: !!authError });

      if (authError) {
        logger.error('Supabase auth error during registration', { message: authError.message });
        if (authError.message.includes('already registered')) {
          setError('Este email ya está registrado');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      logger.debug('Registration successful, showing success step');

      // Show success step instead of redirecting immediately
      setStep('success');
    } catch (error) {
      logger.error('Registration error', { error });
      setError('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-dvh flex-col">
      {/* Subtle decorative element */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="bg-primary/2 absolute -top-40 -right-40 size-125 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-primary/1.5 absolute -bottom-40 -left-40 size-100 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-8 md:px-12">
        <Link href="/" className="group">
          <span className="font-serif text-2xl tracking-tight transition-opacity group-hover:opacity-70">
            tally
          </span>
        </Link>
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ¿Ya tienes cuenta?
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <StepEmail
                  email={formData.email}
                  onChange={(v) => updateField('email', v)}
                  onSubmit={handleEmailSubmit}
                  error={error}
                />
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <StepDetails
                  formData={formData}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  onChange={updateField}
                  onSubmit={handleRegister}
                  onBack={() => setStep('email')}
                  isLoading={isLoading}
                  error={error}
                />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <StepSuccess email={formData.email} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <p className="text-muted-foreground/60 text-xs">
          Al registrarte, aceptas nuestros{' '}
          <Link href="/terms" className="hover:text-foreground underline underline-offset-2">
            Términos
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-2">
            Privacidad
          </Link>
        </p>
      </footer>
    </div>
  );
}

/* ============================================
   STEP: Email
   ============================================ */
function StepEmail({
  email,
  onChange,
  onSubmit,
  error,
}: {
  email: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-12">
      {/* Headline */}
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Empieza gratis
        </h1>
        <p className="text-muted-foreground text-lg">Cobra con QR. Sin comisiones ocultas.</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            className="placeholder:text-muted-foreground/50 h-14 rounded-2xl border-2 px-5 text-center text-lg"
            autoFocus
            autoComplete="email"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-center text-sm"
            >
              {error}
            </motion.p>
          )}
        </div>

        <Button type="submit" size="lg" className="h-14 w-full rounded-2xl text-base">
          Continuar
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>

      {/* Social proof */}
      <div className="text-muted-foreground/60 text-center text-sm">
        <p>Más de 500 restaurantes ya usan tally</p>
      </div>
    </form>
  );
}

/* ============================================
   STEP: Details
   ============================================ */
function StepDetails({
  formData,
  showPassword,
  onTogglePassword,
  onChange,
  onSubmit,
  onBack,
  isLoading,
  error,
}: {
  formData: { email: string; password: string; fullName: string };
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (field: 'email' | 'password' | 'fullName', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* Headline */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground mb-4 text-sm transition-colors"
        >
          ← Cambiar email
        </button>
        <h1 className="font-serif text-3xl leading-tight tracking-tight">Crea tu cuenta</h1>
        <p className="text-muted-foreground">{formData.email}</p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tu nombre</label>
          <Input
            type="text"
            placeholder="María García"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className="h-13 rounded-xl"
            autoFocus
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contraseña</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              className="h-13 rounded-xl pr-12"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  formData.password.length >= i * 2 ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm"
          >
            {error}
          </motion.p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-14 w-full rounded-2xl text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta gratis'
        )}
      </Button>
    </form>
  );
}

/* ============================================
   STEP: Success
   ============================================ */
function StepSuccess({ email }: { email: string }) {
  return (
    <div className="space-y-8 text-center">
      {/* Check animation */}
      <motion.div
        className="bg-primary/10 mx-auto flex size-20 items-center justify-center rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
        >
          <Check className="text-primary size-10" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Message */}
      <div className="space-y-3">
        <h1 className="font-serif text-3xl">¡Cuenta creada!</h1>
        <p className="text-muted-foreground mx-auto max-w-xs">
          Hemos enviado un email a <span className="text-foreground font-medium">{email}</span> para
          verificar tu cuenta.
        </p>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          Haz clic en el enlace del email para continuar con la configuración de tu restaurante.
        </p>
      </div>
    </div>
  );
}
