'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { Check, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { springSmooth, springBouncy } from '@/lib/motion';

// ============================================
// ANIMATED LOGO
// ============================================

interface AnimatedLogoProps {
  name: string;
  logoUrl?: string;
  className?: string;
}

function AnimatedLogo({ name, logoUrl, className }: AnimatedLogoProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = logoUrl && !imageError;

  // Get initials for fallback
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center',
        'size-24 rounded-3xl',
        'from-primary/10 via-primary/5 bg-linear-to-br to-transparent',
        'border-primary/20 border-2',
        'shadow-primary/10 shadow-xl',
        className
      )}
      initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ ...springBouncy, delay: 0.1 }}
    >
      {/* Decorative ring */}
      <motion.div
        className="border-primary/10 absolute -inset-0.75 rounded-3xl border"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />

      {/* Glow effect */}
      <div className="from-primary/20 absolute inset-0 rounded-3xl bg-linear-to-br to-transparent opacity-50 blur-xl" />

      {showImage ? (
        <motion.img
          src={logoUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="size-16 rounded-2xl object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      ) : (
        <motion.span
          className="text-primary font-serif text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, ...springBouncy }}
        >
          {initials}
        </motion.span>
      )}
    </motion.div>
  );
}

// ============================================
// VERIFIED BADGE - Premium
// ============================================

interface VerifiedBadgeProps {
  className?: string;
}

function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'rounded-full',
        'border border-emerald-500/20 bg-emerald-500/10',
        className
      )}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, ...springSmooth }}
    >
      <motion.div
        className="flex size-5 items-center justify-center rounded-full bg-emerald-500"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, ...springBouncy }}
      >
        <Check className="size-3 text-white" strokeWidth={3} />
      </motion.div>
      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
        Restaurante verificado
      </span>
    </motion.div>
  );
}

// ============================================
// TABLE INDICATOR
// ============================================

interface TableIndicatorProps {
  tableNumber: string;
  className?: string;
}

function TableIndicator({ tableNumber, className }: TableIndicatorProps) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-4 px-6 py-4',
        'rounded-2xl',
        'bg-secondary/50 border-border border',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, ...springSmooth }}
    >
      {/* Table icon with number */}
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
        <span className="text-primary font-serif text-xl font-bold">{tableNumber}</span>
      </div>

      <div className="flex-1">
        <p className="text-muted-foreground text-sm">Tu mesa</p>
        <p className="font-semibold">Mesa {tableNumber}</p>
      </div>

      {/* Decorative check */}
      <motion.div
        className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, ...springBouncy }}
      >
        <Check className="size-4 text-emerald-600" strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// CONTINUE BUTTON - Premium
// ============================================

interface ContinueButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

function ContinueButton({ onClick, isLoading, className }: ContinueButtonProps) {
  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const arrowX = useTransform(xSpring, [0, 1], [0, 4]);

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'relative w-full overflow-hidden',
        'flex items-center justify-center gap-3',
        'h-16 rounded-2xl',
        'bg-primary text-primary-foreground',
        'text-lg font-semibold',
        'shadow-primary/25 shadow-lg',
        'disabled:cursor-not-allowed disabled:opacity-70',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, ...springSmooth }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => x.set(1)}
      onHoverEnd={() => x.set(0)}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {isLoading ? (
        <motion.div
          className="border-primary-foreground/30 border-t-primary-foreground size-6 rounded-full border-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          <span>Continuar al pago</span>
          <motion.div style={{ x: arrowX }}>
            <ChevronRight className="size-5" />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}

// ============================================
// POWERED BY BADGE
// ============================================

function PoweredByBadge() {
  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <span className="text-muted-foreground text-xs">powered by</span>
      <motion.span
        className="text-xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        tally<span className="text-primary">.</span>
      </motion.span>
    </motion.div>
  );
}

// ============================================
// SECURITY FEATURES
// ============================================

function SecurityFeatures() {
  const features = [
    { icon: Shield, label: 'Pago seguro' },
    { icon: Sparkles, label: 'Sin descargas' },
  ];

  return (
    <motion.div
      className="flex items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={feature.label}
          className="text-muted-foreground flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.1 }}
        >
          <feature.icon className="size-4" />
          <span className="text-xs">{feature.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// MAIN TRUST CARD - PREMIUM
// ============================================

interface TrustCardPremiumProps {
  restaurant: {
    name: string;
    logoUrl?: string;
    isVerified: boolean;
  };
  table: {
    number: string;
  };
  onContinue: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * TrustCardPremium - Elevated trust screen with premium animations
 *
 * This is the FIRST impression users get after scanning QR.
 * Every animation and detail is crafted to build trust and delight.
 */
export function TrustCardPremium({
  restaurant,
  table,
  onContinue,
  isLoading = false,
  className,
}: TrustCardPremiumProps) {
  return (
    <motion.div className={cn('space-y-8', className)} initial="hidden" animate="visible">
      {/* Restaurant branding */}
      <motion.div
        className="flex flex-col items-center space-y-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatedLogo name={restaurant.name} logoUrl={restaurant.logoUrl} />

        <div className="space-y-3">
          <motion.h1
            className="font-serif text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...springSmooth }}
          >
            {restaurant.name}
          </motion.h1>

          {restaurant.isVerified && <VerifiedBadge />}
        </div>
      </motion.div>

      {/* Table confirmation */}
      <TableIndicator tableNumber={table.number} />

      {/* CTA */}
      <div className="space-y-4">
        <ContinueButton onClick={onContinue} isLoading={isLoading} />

        {/* Terms */}
        <motion.p
          className="text-muted-foreground text-center text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="hover:text-foreground underline underline-offset-2">
            Términos de Servicio
          </a>
        </motion.p>
      </div>

      {/* Security features */}
      <SecurityFeatures />
    </motion.div>
  );
}

export { PoweredByBadge };
