'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Check, ChefHat, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface OrderContentProps {
  order: {
    id: string;
    table_id: string;
    tableNumber: string;
    status: string;
    subtotal_cents: number;
    restaurant_id: string;
  };
  orderItems: Array<{
    id: string;
    product_id: string;
    productName: string;
    quantity: number;
    unit_price_cents: number;
    status: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  products: Array<{
    id: string;
    category_id: string | null;
    name: string;
    price_cents: number;
  }>;
}

export function OrderContent({ order, orderItems, categories, products }: OrderContentProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0]?.id || null);
  const [isLoading, setIsLoading] = React.useState(false);

  const categoryProducts = products.filter((p) => p.category_id === selectedCategory);

  const orderTotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0
  );

  const handleAddItem = async (product: { id: string; name: string; price_cents: number }) => {
    setIsLoading(true);
    const supabase = getClient();

    // Check if item already exists
    const existingItem = orderItems.find((i) => i.product_id === product.id);

    if (existingItem) {
      await supabase
        .from('order_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 1,
        unit_price_cents: product.price_cents,
        status: 'pending',
      });
    }

    // Update order subtotal
    await supabase
      .from('orders')
      .update({ subtotal_cents: orderTotal + product.price_cents })
      .eq('id', order.id);

    router.refresh();
    setIsLoading(false);
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const item = orderItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    const supabase = getClient();

    if (newQty <= 0) {
      await supabase.from('order_items').delete().eq('id', itemId);
    } else {
      await supabase.from('order_items').update({ quantity: newQty }).eq('id', itemId);
    }

    router.refresh();
  };

  const handleMarkServed = async (itemId: string) => {
    const supabase = getClient();
    await supabase.from('order_items').update({ status: 'served' }).eq('id', itemId);
    router.refresh();
  };

  const handleCloseOrder = async () => {
    if (!confirm('¿Cerrar esta comanda?')) return;

    const supabase = getClient();

    await supabase.from('orders').update({ status: 'paying' }).eq('id', order.id);

    router.push('/pos');
    router.refresh();
  };

  const handleBack = () => {
    router.push('/pos');
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col gap-4 lg:flex-row">
      {/* Left: Order Items */}
      <div className="bg-card flex flex-1 flex-col overflow-hidden rounded-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mesa {order.tableNumber}</h1>
              <p className="text-muted-foreground text-sm">{orderItems.length} productos</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleCloseOrder}>
            <Receipt className="mr-2 size-4" />
            Cobrar
          </Button>
        </div>

        {/* Items list */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          <AnimatePresence>
            {orderItems.map((item) => (
              <motion.div
                key={item.id}
                className={cn(
                  'bg-secondary flex items-center justify-between rounded-xl p-3',
                  item.status === 'served' && 'opacity-60'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="text-destructive size-4" />
                      ) : (
                        <Minus className="size-4" />
                      )}
                    </Button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground text-sm">
                      €{(item.unit_price_cents / 100).toFixed(2)} c/u
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    €{((item.quantity * item.unit_price_cents) / 100).toFixed(2)}
                  </span>
                  {item.status === 'pending' && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      onClick={() => handleMarkServed(item.id)}
                    >
                      <ChefHat className="size-4" />
                    </Button>
                  )}
                  {item.status === 'served' && <Check className="size-4 text-green-500" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {orderItems.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">Añade productos del menú</div>
          )}
        </div>

        {/* Total */}
        <div className="bg-background border-t p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">€{(orderTotal / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Right: Menu */}
      <div className="bg-card flex flex-col overflow-hidden rounded-2xl border lg:w-80">
        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto border-b p-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'ghost'}
              className="shrink-0"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {categoryProducts.map((product) => (
            <Button
              key={product.id}
              variant="ghost"
              className="h-auto w-full justify-between py-3"
              onClick={() => handleAddItem(product)}
              disabled={isLoading}
            >
              <span className="text-left">{product.name}</span>
              <span className="text-muted-foreground">
                €{(product.price_cents / 100).toFixed(2)}
              </span>
            </Button>
          ))}

          {categoryProducts.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">Sin productos</p>
          )}
        </div>
      </div>
    </div>
  );
}
