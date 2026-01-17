import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/database';
import type { SelectableOrderItem } from '@/types';

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

/**
 * Get active order for a table with all items
 */
export async function getActiveOrderForTable(tableId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  // Get the active (open) order for this table
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('table_id', tableId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (orderError || !order) {
    return null;
  }

  // Get order items with product details
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq('order_id', order.id);

  if (itemsError) {
    logger.error('[getActiveOrderForTable] items error:', itemsError);
    return { ...order, items: [] };
  }

  return {
    ...order,
    items: items || [],
  };
}

/**
 * Transform DB order items to SelectableOrderItem for UI
 */
export function transformToSelectableItems(
  orderWithItems: OrderWithItems | null
): SelectableOrderItem[] {
  if (!orderWithItems || !orderWithItems.items.length) {
    return [];
  }

  return orderWithItems.items.map((item) => ({
    id: item.id,
    name: item.product?.name || 'Unknown',
    description: item.product?.description || undefined,
    unitPriceCents: item.unit_price_cents,
    quantity: item.quantity,
    category: undefined, // Could add category lookup if needed
    isSelected: false,
    claimedQuantity: item.quantity,
    claimedBy: [],
  }));
}

/**
 * Calculate total cents from order items
 */
export function calculateOrderTotal(items: SelectableOrderItem[]): number {
  return items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}
