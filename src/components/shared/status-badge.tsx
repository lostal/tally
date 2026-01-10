import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-success/10 text-success',
        pending: 'bg-muted text-muted-foreground',
        processing: 'bg-primary/10 text-primary',
        error: 'bg-destructive/10 text-destructive',
        warning: 'bg-amber-500/10 text-amber-600',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  /** Status text to display */
  children: React.ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const STATUS_ICONS = {
  success: Check,
  pending: Clock,
  processing: Loader2,
  error: XCircle,
  warning: AlertCircle,
};

/**
 * StatusBadge - Visual status indicator with icon and text
 *
 * Used for payment status, order status, verification states, etc.
 */
export function StatusBadge({
  variant = 'pending',
  children,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const Icon = STATUS_ICONS[variant || 'pending'];

  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {showIcon && <Icon className={cn('size-3.5', variant === 'processing' && 'animate-spin')} />}
      {children}
    </span>
  );
}
