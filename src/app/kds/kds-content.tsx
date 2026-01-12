'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChefHat, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRealtime, useConnectionIndicator } from '@/lib/hooks';

interface KDSContentProps {
  restaurantId: string;
  orders: Array<{
    id: string;
    tableNumber: string;
    status: string;
    created_at: string;
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      status: string;
    }>;
  }>;
}

type ItemStatus = 'pending' | 'preparing' | 'ready';

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  preparing: { label: 'Preparando', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  ready: { label: 'Listo', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
};

export function KDSContent({ restaurantId, orders: initialOrders }: KDSContentProps) {
  const [orders, setOrders] = React.useState(initialOrders);

  // Real-time subscription for order items
  const { status: connectionStatus } = useRealtime({
    table: 'order_items',
    enabled: true,
    onInsert: () => refreshOrders(),
    onUpdate: () => refreshOrders(),
    onDelete: () => refreshOrders(),
  });

  const connectionIndicator = useConnectionIndicator(connectionStatus);

  const refreshOrders = async () => {
    const res = await fetch(`/api/kds/orders?restaurantId=${restaurantId}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  };

  React.useEffect(() => {
    // Refresh every 30 seconds as backup
    const interval = setInterval(refreshOrders, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleUpdateItemStatus = async (orderId: string, itemId: string, newStatus: ItemStatus) => {
    await fetch(`/api/orders/${orderId}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, status: newStatus }),
    });
    refreshOrders();
  };

  const getNextStatus = (current: ItemStatus): ItemStatus | null => {
    if (current === 'pending') return 'preparing';
    if (current === 'preparing') return 'ready';
    return null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  // Group orders by status priority
  const pendingOrders = orders.filter((o) => o.items.some((i) => i.status === 'pending'));
  const preparingOrders = orders.filter(
    (o) =>
      o.items.some((i) => i.status === 'preparing') && !o.items.some((i) => i.status === 'pending')
  );
  const readyOrders = orders.filter((o) =>
    o.items.every((i) => i.status === 'ready' || i.status === 'served')
  );

  return (
    <div className="bg-background min-h-screen p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="text-primary size-8" />
          <h1 className="font-serif text-3xl">Cocina</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={connectionIndicator.icon}></span>
            <span className="text-muted-foreground">{connectionIndicator.label}</span>
          </div>
          <Button variant="outline" onClick={refreshOrders}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-amber-500" />
            <h2 className="font-semibold">Pendiente</h2>
            <Badge variant="secondary">{pendingOrders.length}</Badge>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateItemStatus}
                  formatTime={formatTime}
                  getNextStatus={getNextStatus}
                />
              ))}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <div className="text-muted-foreground rounded-xl border-2 border-dashed p-8 text-center">
                Sin pedidos pendientes
              </div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-blue-500" />
            <h2 className="font-semibold">Preparando</h2>
            <Badge variant="secondary">{preparingOrders.length}</Badge>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateItemStatus}
                  formatTime={formatTime}
                  getNextStatus={getNextStatus}
                />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="text-muted-foreground rounded-xl border-2 border-dashed p-8 text-center">
                Nada en preparación
              </div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-emerald-500" />
            <h2 className="font-semibold">Listo</h2>
            <Badge variant="secondary">{readyOrders.length}</Badge>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateItemStatus}
                  formatTime={formatTime}
                  getNextStatus={getNextStatus}
                  isReady
                />
              ))}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <div className="text-muted-foreground rounded-xl border-2 border-dashed p-8 text-center">
                Sin pedidos listos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: KDSContentProps['orders'][0];
  onUpdateStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  formatTime: (date: string) => string;
  getNextStatus: (current: ItemStatus) => ItemStatus | null;
  isReady?: boolean;
}

function OrderCard({ order, onUpdateStatus, formatTime, getNextStatus, isReady }: OrderCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'bg-card rounded-2xl border-2 p-4',
        isReady && 'border-emerald-300 bg-emerald-50/50'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Mesa {order.tableNumber}</span>
          {isReady && <Bell className="size-5 animate-pulse text-emerald-600" />}
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <Clock className="size-4" />
          <span>{formatTime(order.created_at)}</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item) => {
          const status = item.status as ItemStatus;
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
          const nextStatus = getNextStatus(status);

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between rounded-xl border p-3',
                config.bgColor
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.quantity}×</span>
                <span>{item.productName}</span>
              </div>
              {nextStatus ? (
                <Button
                  size="sm"
                  variant={status === 'pending' ? 'default' : 'outline'}
                  onClick={() => onUpdateStatus(order.id, item.id, nextStatus)}
                  className="h-8"
                >
                  {status === 'pending' ? 'Iniciar' : <Check className="size-4" />}
                </Button>
              ) : (
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
