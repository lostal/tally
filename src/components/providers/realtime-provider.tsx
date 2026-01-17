/**
 * Realtime Provider
 *
 * Provides global realtime connection state and configuration.
 * Wraps the app to manage Supabase Realtime connection lifecycle.
 */
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface RealtimeContextValue {
  /** Global connection status */
  status: RealtimeStatus;
  /** Whether realtime is enabled */
  isEnabled: boolean;
  /** Enable/disable realtime globally */
  setEnabled: (enabled: boolean) => void;
  /** Force reconnect */
  reconnect: () => void;
  /** Number of active channels */
  activeChannels: number;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
  /** Whether to enable realtime on mount (default: true) */
  initialEnabled?: boolean;
}

export function RealtimeProvider({ children, initialEnabled = true }: RealtimeProviderProps) {
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [activeChannels, setActiveChannels] = useState(0);
  const [heartbeatChannel, setHeartbeatChannel] = useState<RealtimeChannel | null>(null);

  const supabase = getClient();

  // Set up presence/heartbeat channel to monitor overall connection
  useEffect(() => {
    if (!isEnabled) {
      if (heartbeatChannel) {
        supabase.removeChannel(heartbeatChannel);
        setHeartbeatChannel(null);
      }
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');

    // Create a presence channel to monitor connection state
    const channel = supabase.channel('realtime-heartbeat', {
      config: {
        presence: { key: 'heartbeat' },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence sync means we're connected
        setStatus('connected');
      })
      .subscribe((channelStatus) => {
        if (channelStatus === 'SUBSCRIBED') {
          setStatus('connected');
          // Track presence to keep connection alive
          channel.track({});
        } else if (channelStatus === 'CHANNEL_ERROR') {
          setStatus('error');
        } else if (channelStatus === 'TIMED_OUT') {
          setStatus('error');
        } else if (channelStatus === 'CLOSED') {
          setStatus('disconnected');
        }
      });

    setHeartbeatChannel(channel);

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isEnabled, supabase]);

  // Monitor all channels to count active subscriptions
  useEffect(() => {
    const updateChannelCount = () => {
      const channels = supabase.getChannels();
      // Exclude our heartbeat channel from count
      const count = channels.filter((ch) => ch.topic !== 'realtime-heartbeat').length;
      setActiveChannels(count);
    };

    // Check on mount and when status changes
    updateChannelCount();

    // Poll for changes (Supabase doesn't expose channel events globally)
    const interval = setInterval(updateChannelCount, 2000);

    return () => clearInterval(interval);
  }, [supabase, status]);

  // Reconnect function
  const reconnect = () => {
    if (heartbeatChannel) {
      supabase.removeChannel(heartbeatChannel);
      setHeartbeatChannel(null);
    }
    // Trigger reconnection by toggling enabled state
    setIsEnabled(false);
    setTimeout(() => setIsEnabled(true), 100);
  };

  const value: RealtimeContextValue = {
    status,
    isEnabled,
    setEnabled: setIsEnabled,
    reconnect,
    activeChannels,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

/**
 * Hook to access realtime connection state
 *
 * @example
 * const { status, reconnect, activeChannels } = useRealtimeContext();
 */
export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
}

/**
 * Hook to get connection status with UI helpers
 */
export function useRealtimeStatus() {
  const { status } = useRealtimeContext();

  const getIndicator = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          label: 'Conectado',
          icon: '🟢',
          variant: 'success' as const,
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          label: 'Conectando...',
          icon: '🟡',
          variant: 'warning' as const,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          label: 'Error de conexión',
          icon: '🔴',
          variant: 'destructive' as const,
        };
      case 'disconnected':
        return {
          color: 'bg-gray-500',
          label: 'Desconectado',
          icon: '⚫',
          variant: 'secondary' as const,
        };
    }
  };

  return {
    status,
    ...getIndicator(),
  };
}
