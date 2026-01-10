import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button/element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState - Placeholder for empty data states
 *
 * Used when there's no data to display (empty cart, no items selected, etc.)
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && (
        <div className="bg-muted text-muted-foreground mb-4 flex size-16 items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-2 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
