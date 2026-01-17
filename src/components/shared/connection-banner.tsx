'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { springSmooth } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/lib/hooks/use-realtime';

interface ConnectionBannerProps {
  /** Current connection status */
  status: ConnectionStatus;
  /** Callback when user clicks reconnect */
  onReconnect?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * ConnectionBanner - Sticky top banner showing connection status
 *
 * Features:
 * - Green: Connected
 * - Yellow: Connecting/Reconnecting
 * - Red: Disconnected with reconnect button
 * - Auto-hide when connected (after 2s)
 * - Smooth slide animations
 */
export function ConnectionBanner({ status, onReconnect, className }: ConnectionBannerProps) {
  const [showConnected, setShowConnected] = React.useState(false);

  // Show connected state briefly, then hide
  React.useEffect(() => {
    if (status === 'connected') {
      setShowConnected(true);
      const timer = setTimeout(() => setShowConnected(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowConnected(true);
    }
  }, [status]);

  // Don't show anything if connected and timer expired
  if (status === 'connected' && !showConnected) {
    return null;
  }

  const config = {
    connected: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-700 dark:text-green-400',
      icon: Wifi,
      label: 'Conectado',
      showButton: false,
    },
    connecting: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: RefreshCw,
      label: 'Conectando...',
      showButton: false,
    },
    reconnecting: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: RefreshCw,
      label: 'Reconectando...',
      showButton: false,
    },
    disconnected: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      icon: WifiOff,
      label: 'Sin conexión',
      showButton: true,
    },
  }[status];

  const Icon = config.icon;
  const isSpinning = status === 'connecting' || status === 'reconnecting';

  return (
    <AnimatePresence>
      {showConnected && (
        <motion.div
          className={cn(
            'sticky top-0 z-50 border-b backdrop-blur-xl',
            config.bg,
            config.border,
            className
          )}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={springSmooth}
        >
          <div className="container-app flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-2">
              <Icon
                className={cn('size-4', config.text, isSpinning && 'animate-spin')}
                aria-hidden="true"
              />
              <span className={cn('text-sm font-medium', config.text)}>{config.label}</span>
            </div>

            {config.showButton && onReconnect && (
              <motion.button
                onClick={onReconnect}
                className={cn(
                  'rounded-lg px-3 py-1 text-sm font-medium transition-colors',
                  'bg-red-500/20 hover:bg-red-500/30',
                  config.text
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reintentar
              </motion.button>
            )}
          </div>

          {/* Warning message for disconnected state */}
          {status === 'disconnected' && (
            <motion.div
              className="border-t border-red-500/20 bg-red-500/5 py-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className={cn('container-app text-xs', config.text)}>
                Los datos pueden estar desactualizados. Verifica tu conexión a internet.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
