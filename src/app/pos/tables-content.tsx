'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Users, Clock, Receipt, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Table } from '@/types/database';

interface POSTablesContentProps {
  restaurantId: string;
  tables: Table[];
  orders: Array<{
    id: string;
    table_id: string;
    status: string;
    subtotal_cents: number;
    created_at: string;
  }>;
}

// Status styles matching Admin Panel (src/app/admin/tables/tables-content.tsx)
const STATUS_CONFIG: Record<
  string,
  { label: string; containerClass: string; dotClass: string; mutedTextClass: string }
> = {
  available: {
    label: 'Libre',
    containerClass: 'border-border bg-background hover:border-primary',
    dotClass: 'bg-emerald-500',
    mutedTextClass: 'text-muted-foreground',
  },
  occupied: {
    label: 'Ocupada',
    containerClass:
      'border-primary bg-primary text-primary-foreground shadow-lg hover:bg-primary/95',
    dotClass: 'bg-amber-400',
    mutedTextClass: 'text-primary-foreground/80',
  },
  paying: {
    label: 'Pagando',
    containerClass: 'border-muted bg-muted/30 hover:bg-muted/50',
    dotClass: 'bg-blue-500',
    mutedTextClass: 'text-muted-foreground',
  },
  reserved: {
    label: 'Reservada',
    containerClass: 'border-border border-dashed bg-secondary/50 hover:bg-secondary/70',
    dotClass: 'bg-orange-500',
    mutedTextClass: 'text-muted-foreground',
  },
};

export function POSTablesContent({ restaurantId, tables, orders }: POSTablesContentProps) {
  const router = useRouter();
  const [activeTableId, setActiveTableId] = React.useState<string | null>(null);

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.table_id === tableId);
  };

  const handleTableClick = async (table: Table) => {
    setActiveTableId(table.id);
    const existingOrder = getTableOrder(table.id);

    if (existingOrder) {
      router.push(`/pos/orders/${existingOrder.id}`);
    } else {
      // Create new order
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: table.id, restaurantId }),
        });

        if (res.ok) {
          const data = await res.json();
          router.push(`/pos/orders/${data.order.id}`);
        }
      } catch (error) {
        console.error('Error creating order:', error);
        setActiveTableId(null);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="font-serif text-3xl">Punto de Venta</h1>
          <p className="text-muted-foreground mt-2">
            {tables.filter((t) => t.status === 'available').length} mesas libres de {tables.length}
          </p>
        </div>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table, index) => {
          const order = getTableOrder(table.id);
          const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
          const isLoading = activeTableId === table.id;

          return (
            <motion.button
              key={table.id}
              onClick={() => !isLoading && handleTableClick(table)}
              disabled={isLoading}
              className={cn(
                'group relative flex flex-col justify-between rounded-2xl border-2 p-6 text-left transition-all duration-300',
                config.containerClass,
                isLoading && 'opacity-80'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Header */}
              <div className="flex w-full items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl">Mesa {table.number}</h3>
                  <div
                    className={cn('mt-1 flex items-center gap-2 text-sm', config.mutedTextClass)}
                  >
                    <Users className="size-4" />
                    <span>{table.capacity} p.</span>
                  </div>
                </div>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <div className={cn('size-3 rounded-full shadow-sm', config.dotClass)} />
                )}
              </div>

              {/* Order Info */}
              <div className="mt-6 min-h-[40px]">
                {order ? (
                  <div className="space-y-1">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium',
                        config.mutedTextClass // Reuse muted text for subtle details
                      )}
                    >
                      <Clock className="size-4" />
                      <span>{formatTime(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Receipt className="size-5" />
                      <span>€{(order.subtotal_cents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className={cn('text-sm', config.mutedTextClass)}>Toca para abrir</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          No hay mesas configuradas. Ve al panel de administración.
        </div>
      )}
    </div>
  );
}
