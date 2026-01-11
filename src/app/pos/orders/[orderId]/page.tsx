import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderContent } from './order-content';

interface OrderPageParams {
  params: Promise<{ orderId: string }>;
}

/**
 * POS Order Detail Page
 */
export default async function OrderPage({ params }: OrderPageParams) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Get order with items
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, tables(number)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    redirect('/pos');
  }

  // Get order items with products
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, products(name, description)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  // Get menu for adding items
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .eq('restaurant_id', order.restaurant_id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const { data: products } = await supabase
    .from('products')
    .select('id, category_id, name, price_cents, is_available')
    .eq('restaurant_id', order.restaurant_id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  return (
    <OrderContent
      order={{
        ...order,
        tableNumber: (order.tables as { number: string })?.number || '?',
      }}
      orderItems={(orderItems || []).map((item) => ({
        ...item,
        productName: (item.products as { name: string })?.name || 'Unknown',
      }))}
      categories={categories || []}
      products={products || []}
    />
  );
}
