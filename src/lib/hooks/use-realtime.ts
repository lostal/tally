/**
 * useRealtime Hook
 *
 * Manages Supabase Realtime subscriptions for live updates.
 * Handles reconnection, connection state, and cleanup.
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface UseRealtimeOptions<T> {
  /** Table to subscribe to */
  table: string;
  /** Schema (default: public) */
  schema?: string;
  /** Filter column (e.g., 'order_id') */
  filterColumn?: string;
  /** Filter value */
  filterValue?: string;
  /** Callback when data changes */
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old: T }) => void;
  /** Whether subscription is enabled */
  enabled?: boolean;
}

interface UseRealtimeReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Manually reconnect */
  reconnect: () => void;
  /** Unsubscribe */
  unsubscribe: () => void;
}

/**
 * Subscribe to real-time changes on a Supabase table
 *
 * @example
 * const { status } = useRealtime({
 *   table: 'order_items',
 *   filterColumn: 'order_id',
 *   filterValue: orderId,
 *   onUpdate: (item) => updateItem(item),
 *   enabled: !!orderId,
 * });
 */
export function useRealtime<T extends object>({
  table,
  schema = 'public',
  filterColumn,
  filterValue,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>): UseRealtimeReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const supabase = getClient();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  // Unsubscribe manually
  const unsubscribe = useCallback(() => {
    cleanup();
    setStatus('disconnected');
    reconnectAttempts.current = 0;
  }, [cleanup]);

  // Reconnect with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.warn(`[Realtime] Max reconnect attempts reached for ${table}`);
      setStatus('disconnected');
      return;
    }

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
    setStatus('reconnecting');

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      subscribe();
    }, delay);
  }, [table]);

  // Subscribe to channel
  const subscribe = useCallback(() => {
    if (!enabled) return;

    cleanup();
    setStatus('connecting');

    // Build filter if provided
    const filter = filterColumn && filterValue ? `${filterColumn}=eq.${filterValue}` : undefined;

    const channelName = `${table}-${filterValue || 'all'}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on<T>(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload.new as T);
              break;
            case 'UPDATE':
              onUpdate?.(payload.new as T);
              break;
            case 'DELETE':
              onDelete?.({ old: payload.old as T });
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
          reconnectAttempts.current = 0;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error for ${table}`);
          scheduleReconnect();
        } else if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Subscription timed out for ${table}`);
          scheduleReconnect();
        } else if (status === 'CLOSED') {
          setStatus('disconnected');
        }
      });

    channelRef.current = channel;
  }, [
    enabled,
    table,
    schema,
    filterColumn,
    filterValue,
    onInsert,
    onUpdate,
    onDelete,
    supabase,
    cleanup,
    scheduleReconnect,
  ]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    subscribe();
  }, [subscribe]);

  // Effect to manage subscription lifecycle
  useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return cleanup;
  }, [enabled, filterValue, subscribe, cleanup]);

  return {
    status,
    reconnect,
    unsubscribe,
  };
}

/**
 * Hook to get connection status UI representation
 */
export function useConnectionIndicator(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return { color: 'bg-green-500', label: 'Conectado', icon: '🟢' };
    case 'connecting':
      return { color: 'bg-yellow-500', label: 'Conectando...', icon: '🟡' };
    case 'reconnecting':
      return { color: 'bg-yellow-500', label: 'Reconectando...', icon: '🟡' };
    case 'disconnected':
      return { color: 'bg-red-500', label: 'Desconectado', icon: '🔴' };
  }
}
