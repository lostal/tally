'use client';

import { motion } from 'motion/react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '@/lib/hooks/use-realtime';
import { useConnectionIndicator } from '@/lib/hooks/use-realtime';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Visual indicator for real-time connection status
 */
export function ConnectionStatusIndicator({
  status,
  showLabel = true,
  compact = false,
  className,
}: ConnectionStatusIndicatorProps) {
  const { color, label } = useConnectionIndicator(status);

  const isConnecting = status === 'connecting' || status === 'reconnecting';
  const isDisconnected = status === 'disconnected';

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5',
        compact && 'px-2 py-1',
        isDisconnected && 'bg-destructive/10',
        !isDisconnected && 'bg-muted/50',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={cn('relative', compact ? 'size-3' : 'size-4')}
        animate={isConnecting ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {isConnecting ? (
          <Loader2 className={cn('animate-spin', color.replace('bg-', 'text-'))} />
        ) : isDisconnected ? (
          <WifiOff className="text-destructive" />
        ) : (
          <Wifi className="text-green-500" />
        )}

        {status === 'connected' && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.div>

      {showLabel && (
        <span
          className={cn(
            'text-muted-foreground text-xs font-medium',
            isDisconnected && 'text-destructive',
            compact && 'text-[10px]'
          )}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
}

/**
 * Floating connection banner for critical disconnection
 */
export function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') return null;

  const isDisconnected = status === 'disconnected';

  return (
    <motion.div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 shadow-lg',
        isDisconnected ? 'bg-destructive text-destructive-foreground' : 'bg-yellow-500 text-black'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {isDisconnected ? (
        <>
          <WifiOff className="size-4" />
          <span className="text-sm font-medium">Sin conexión</span>
        </>
      ) : (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Reconectando...</span>
        </>
      )}
    </motion.div>
  );
}
