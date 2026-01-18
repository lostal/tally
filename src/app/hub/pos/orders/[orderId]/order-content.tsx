'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Receipt, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { ModifierSelector } from '@/components/pos/modifier-selector';
import { parseModifiers, formatModifiers } from '@/lib/pos/modifiers';
import type { Json } from '@/types/database';

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
    modifiers?: Json;
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

interface ApiModifier {
  id: string;
  name: string;
  price_cents: number;
  is_required: boolean;
}

export function OrderContent({ order, orderItems, categories, products }: OrderContentProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0]?.id || null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showVoidDialog, setShowVoidDialog] = React.useState(false);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidLoading, setVoidLoading] = React.useState(false);
  const [modifierDialog, setModifierDialog] = React.useState<{
    product: { id: string; name: string; price_cents: number };
    modifiers: Array<{ id: string; name: string; priceCents: number; isRequired: boolean }>;
  } | null>(null);

  const categoryProducts = products.filter((p) => p.category_id === selectedCategory);

  const orderTotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0
  );

  const handleAddItem = async (product: { id: string; name: string; price_cents: number }) => {
    setIsLoading(true);
    try {
      // Fetch modifiers for this product
      const res = await fetch(`/api/products/${product.id}/modifiers`);
      const { modifiers } = await res.json();

      // If product has modifiers, show the modifier selector dialog
      if (modifiers && modifiers.length > 0) {
        // Convert snake_case to camelCase for the component
        const formattedModifiers = modifiers.map((m: ApiModifier) => ({
          id: m.id,
          name: m.name,
          priceCents: m.price_cents,
          isRequired: m.is_required,
        }));

        setModifierDialog({ product, modifiers: formattedModifiers });
      } else {
        // No modifiers, add item directly
        await addItemToOrder(product, []);
      }
    } catch (error) {
      logger.error('Error fetching modifiers:', error);
      // If fetching modifiers fails, add item without modifiers
      await addItemToOrder(product, []);
    }
    setIsLoading(false);
  };

  const addItemToOrder = async (
    product: { id: string; name: string; price_cents: number },
    selectedModifiers: Array<{ id: string; name: string; priceCents: number }>
  ) => {
    try {
      await fetch(`/api/orders/${order.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          unitPriceCents: product.price_cents,
          modifiers: selectedModifiers.map((m) => ({
            id: m.id,
            name: m.name,
            priceCents: m.priceCents,
          })),
        }),
      });
      router.refresh();
      setModifierDialog(null);
    } catch (error) {
      logger.error('Error adding item to order:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const item = orderItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    await fetch(`/api/orders/${order.id}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity: newQty }),
    });
    router.refresh();
  };

  const handleMarkServed = async (itemId: string) => {
    await fetch(`/api/orders/${order.id}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, status: 'served' }),
    });
    router.refresh();
  };

  const handleCloseOrder = async () => {
    if (!confirm('¿Cerrar esta comanda?')) return;

    await fetch(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paying' }),
    });

    router.push('/pos');
    router.refresh();
  };

  const handleBack = () => {
    router.push('/pos');
  };

  const handleVoidOrder = async () => {
    if (!voidReason || voidReason.length < 5) {
      alert('Por favor, proporciona un motivo (mínimo 5 caracteres)');
      return;
    }

    setVoidLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason }),
      });

      const result = await res.json();

      if (res.ok) {
        if (result.approved) {
          alert('Pedido anulado correctamente');
        } else {
          alert('Solicitud de anulación enviada al manager');
        }
        router.push('/hub/pos');
        router.refresh();
      } else {
        alert(`Error: ${result.error || 'No se pudo anular el pedido'}`);
      }
    } catch (error) {
      logger.error('Error voiding order:', error);
      alert('Error al anular el pedido');
    } finally {
      setVoidLoading(false);
      setShowVoidDialog(false);
      setVoidReason('');
    }
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col gap-4 lg:flex-row">
      {/* Left: Order Items */}
      <div className="bg-card flex flex-1 flex-col overflow-hidden rounded-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Volver">
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mesa {order.tableNumber}</h1>
              <p className="text-muted-foreground text-sm">{orderItems.length} productos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setShowVoidDialog(true)}>
              <XCircle className="mr-2 size-4" />
              Anular
            </Button>
            <Button variant="outline" onClick={handleCloseOrder}>
              <Receipt className="mr-2 size-4" />
              Cobrar
            </Button>
          </div>
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
                      aria-label={item.quantity === 1 ? 'Eliminar producto' : 'Reducir cantidad'}
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
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.modifiers && parseModifiers(item.modifiers).length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {formatModifiers(parseModifiers(item.modifiers))}
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      €{(item.unit_price_cents / 100).toFixed(2)} c/u
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status !== 'served' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkServed(item.id);
                      }}
                      aria-label="Marcar como servido"
                    >
                      <Check className="size-4" />
                    </Button>
                  )}
                  <span className="font-semibold">
                    €{((item.quantity * item.unit_price_cents) / 100).toFixed(2)}
                  </span>
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

      {/* Void Order Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Pedido</DialogTitle>
            <DialogDescription>
              Proporciona un motivo para anular este pedido. Esta acción requiere aprobación de un
              manager si eres camarero.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voidReason">Motivo de anulación</Label>
              <Input
                id="voidReason"
                placeholder="Ej: Cliente canceló el pedido"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                minLength={5}
              />
              <p className="text-muted-foreground text-xs">Mínimo 5 caracteres</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidOrder}
              disabled={voidLoading || voidReason.length < 5}
            >
              {voidLoading ? 'Anulando...' : 'Confirmar Anulación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier Selector Dialog */}
      {modifierDialog && (
        <ModifierSelector
          productName={modifierDialog.product.name}
          modifiers={modifierDialog.modifiers}
          onConfirm={(selected) => addItemToOrder(modifierDialog.product, selected)}
          onCancel={() => setModifierDialog(null)}
        />
      )}
    </div>
  );
}
