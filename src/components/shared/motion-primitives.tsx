'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { springSnappy, springSmooth } from '@/lib/motion';

// ============================================
// ANIMATED CARD
// ============================================

interface AnimatedCardProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Enable 3D tilt effect on hover */
  tilt?: boolean;
  /** Enable glow effect */
  glow?: boolean;
  /** Hover lift amount in pixels */
  liftAmount?: number;
  /** Disable all animations */
  static?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * AnimatedCard - Premium card with hover effects
 *
 * Features:
 * - Smooth lift on hover
 * - Optional 3D tilt effect
 * - Optional glow effect
 * - Press feedback
 */
export function AnimatedCard({
  children,
  className,
  tilt = false,
  glow = false,
  liftAmount = 4,
  static: isStatic = false,
  onClick,
}: AnimatedCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring values
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springSnappy);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springSnappy);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isStatic) {
    return (
      <div className={cn('bg-card border-border rounded-2xl border-2 p-6', className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-card border-border rounded-2xl border-2 p-6',
        'transition-colors duration-200',
        glow && 'hover:shadow-[0_0_40px_-10px_var(--primary)]',
        className
      )}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -liftAmount,
        borderColor: 'var(--primary)',
        transition: springSmooth,
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED NUMBER
// ============================================

interface AnimatedNumberProps {
  value: number;
  /** Format function (e.g., for currency) */
  format?: (value: number) => string;
  /** CSS classes */
  className?: string;
  /** Duration of animation */
  duration?: number;
}

/**
 * AnimatedNumber - Smoothly animated number display
 *
 * Great for prices, stats, counters.
 */
export function AnimatedNumber({
  value,
  format = (v) => v.toString(),
  className,
  duration = 0.5,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    duration,
  });
  const [displayValue, setDisplayValue] = React.useState(format(value));

  React.useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  React.useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(format(Math.round(latest)));
    });
    return unsubscribe;
  }, [springValue, format]);

  return (
    <motion.span className={cn('tabular-nums', className)} key={value}>
      {displayValue}
    </motion.span>
  );
}

// ============================================
// ANIMATED PRICE
// ============================================

interface AnimatedPriceProps {
  /** Amount in cents */
  amountCents: number;
  /** Currency symbol */
  currency?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** CSS classes */
  className?: string;
}

const priceSize = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl font-serif',
};

/**
 * AnimatedPrice - Currency display with smooth animation
 */
export function AnimatedPrice({
  amountCents,
  currency = '€',
  size = 'md',
  className,
}: AnimatedPriceProps) {
  const format = React.useCallback(
    (cents: number) => `${currency}${(cents / 100).toFixed(2)}`,
    [currency]
  );

  return (
    <AnimatedNumber
      value={amountCents}
      format={format}
      className={cn(priceSize[size], 'font-semibold', className)}
    />
  );
}

// ============================================
// PAGE HEADER
// ============================================

interface PageHeaderProps {
  /** Small label above title */
  label?: string;
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Right side action */
  action?: React.ReactNode;
  /** CSS classes */
  className?: string;
}

/**
 * PageHeader - Consistent header component for all pages
 */
export function PageHeader({ label, title, subtitle, action, className }: PageHeaderProps) {
  return (
    <motion.header
      className={cn('flex items-start justify-between gap-4', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSmooth}
    >
      <div className="space-y-1">
        {label && (
          <motion.p
            className="text-muted-foreground text-xs font-semibold tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.p>
        )}
        <motion.h1
          className="font-serif text-3xl tracking-tight text-balance"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, ...springSmooth }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, ...springSmooth }}
        >
          {action}
        </motion.div>
      )}
    </motion.header>
  );
}

// ============================================
// STATUS INDICATOR
// ============================================

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusIndicatorProps {
  /** Status type */
  status: StatusType;
  /** Label text */
  label?: string;
  /** Pulsing animation */
  pulse?: boolean;
  /** Size */
  size?: 'sm' | 'md';
  /** CSS classes */
  className?: string;
}

const statusColors: Record<StatusType, { dot: string; bg: string; text: string }> = {
  success: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
  },
  error: {
    dot: 'bg-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
  },
  info: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
  },
  neutral: {
    dot: 'bg-muted-foreground',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
};

/**
 * StatusIndicator - Animated status dot with optional label
 */
export function StatusIndicator({
  status,
  label,
  pulse = false,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const colors = statusColors[status];
  const dotSize = size === 'sm' ? 'size-2' : 'size-2.5';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(dotSize, 'rounded-full', colors.dot)}
        animate={
          pulse
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }
            : undefined
        }
        transition={
          pulse
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />
      {label && (
        <span className={cn('text-sm font-medium', size === 'sm' && 'text-xs', colors.text)}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================
// FLOATING ACTION BAR
// ============================================

interface FloatingActionBarProps {
  children: React.ReactNode;
  /** Show/hide the bar */
  visible?: boolean;
  /** CSS classes */
  className?: string;
}

/**
 * FloatingActionBar - Bottom sticky bar with smooth animation
 */
export function FloatingActionBar({ children, visible = true, className }: FloatingActionBarProps) {
  return (
    <motion.div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'border-border bg-background/95 border-t backdrop-blur-xl',
        'p-4 pb-[max(1rem,env(safe-area-inset-bottom))]',
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: visible ? 0 : 100,
        opacity: visible ? 1 : 0,
      }}
      transition={springSmooth}
    >
      <div className="container-app">{children}</div>
    </motion.div>
  );
}

// ============================================
// SECTION TITLE
// ============================================

interface SectionTitleProps {
  children: React.ReactNode;
  /** CSS classes */
  className?: string;
}

/**
 * SectionTitle - Consistent section header styling
 */
export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'text-muted-foreground text-xs font-semibold tracking-widest uppercase',
        className
      )}
    >
      {children}
    </h2>
  );
}

// ============================================
// SHIMMER SKELETON
// ============================================

interface ShimmerProps {
  /** CSS classes for sizing */
  className?: string;
}

/**
 * Shimmer - Premium loading skeleton
 */
export function Shimmer({ className }: ShimmerProps) {
  return (
    <div className={cn('bg-muted relative overflow-hidden rounded-lg', className)}>
      <div className="animate-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// ============================================
// ICON BUTTON
// ============================================

interface IconButtonProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'ghost' | 'outline' | 'solid';
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Aria label */
  'aria-label'?: string;
}

const iconButtonSizes = {
  sm: 'size-9',
  md: 'size-11',
  lg: 'size-14',
};

const iconButtonVariants = {
  ghost: 'hover:bg-accent',
  outline: 'border-2 border-border hover:border-primary hover:bg-accent',
  solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

/**
 * IconButton - Animated icon button with consistent sizing
 */
export function IconButton({
  children,
  className,
  size = 'md',
  variant = 'ghost',
  onClick,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: IconButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        'transition-colors focus-visible:ring-2 focus-visible:outline-none',
        'focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        iconButtonSizes[size],
        iconButtonVariants[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={springSnappy}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
