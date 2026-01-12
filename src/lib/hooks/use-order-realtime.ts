/**
 * useOrderRealtime Hook
 *
 * Specialized hook for real-time order item synchronization.
 * Handles updates to order_items table and syncs with bill store.
 */
'use client';

import { useEffect, useCallback } from 'react';
import { useBillStore } from '@/stores/bill-store';
import { useRealtime, type ConnectionStatus } from './use-realtime';
import { getClient } from '@/lib/supabase/client';
import type { OrderItem } from '@/types';

// Database row type (snake_case from Supabase)
interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  modifiers: unknown;
  notes: string | null;
  status: string;
  created_at: string;
}

// Transform database row to app type
function transformOrderItem(row: OrderItemRow, productName?: string): OrderItem {
  return {
    id: row.id,
    name: productName || 'Item',
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
  };
}

interface UseOrderRealtimeOptions {
  /** Order ID to subscribe to */
  orderId?: string;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseOrderRealtimeReturn {
  /** Current order items */
  items: OrderItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Connection status */
  connectionStatus: ConnectionStatus;
  /** Refresh items from server */
  refresh: () => Promise<void>;
}

/**
 * Hook for real-time order item synchronization
 *
 * @example
 * const { items, connectionStatus } = useOrderRealtime({
 *   orderId: params.orderId,
 *   autoFetch: true,
 * });
 */
export function useOrderRealtime({
  orderId,
  autoFetch = true,
}: UseOrderRealtimeOptions = {}): UseOrderRealtimeReturn {
  const { items, isLoading, error, setItems, setLoading, setError, reset } = useBillStore();
  const supabase = getClient();

  // Fetch order items with product names
  const fetchItems = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select(
          `
          *,
          product:products(name)
        `
        )
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const transformedItems = (data || []).map((row) =>
        transformOrderItem(row as OrderItemRow, row.product?.name)
      );

      setItems(transformedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    }
  }, [orderId, supabase, setItems, setLoading, setError]);

  // Handle real-time updates
  const handleInsert = useCallback(
    async (row: OrderItemRow) => {
      // Fetch product name for the new item
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', row.product_id)
        .single();

      const newItem = transformOrderItem(row, product?.name);
      setItems([...items, newItem]);
    },
    [items, setItems, supabase]
  );

  const handleUpdate = useCallback(
    (row: OrderItemRow) => {
      const updatedItems = items.map((item) =>
        item.id === row.id
          ? { ...item, quantity: row.quantity, unitPriceCents: row.unit_price_cents }
          : item
      );
      setItems(updatedItems);
    },
    [items, setItems]
  );

  const handleDelete = useCallback(
    ({ old }: { old: OrderItemRow }) => {
      const filteredItems = items.filter((item) => item.id !== old.id);
      setItems(filteredItems);
    },
    [items, setItems]
  );

  // Subscribe to order_items changes
  const { status: connectionStatus } = useRealtime<OrderItemRow>({
    table: 'order_items',
    filterColumn: 'order_id',
    filterValue: orderId,
    enabled: !!orderId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && orderId) {
      fetchItems();
    }

    return () => {
      reset();
    };
  }, [orderId, autoFetch, fetchItems, reset]);

  return {
    items,
    isLoading,
    error,
    connectionStatus,
    refresh: fetchItems,
  };
}
