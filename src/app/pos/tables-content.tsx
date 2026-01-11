'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Clock, Receipt } from 'lucide-react';
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

// Minimal status styles - text-focused, subtle backgrounds
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Libre',
    className: 'bg-secondary text-foreground',
  },
  occupied: {
    label: 'Ocupada',
    className: 'bg-primary text-primary-foreground',
  },
  paying: {
    label: 'Pagando',
    className: 'bg-muted text-muted-foreground',
  },
  reserved: {
    label: 'Reservada',
    className: 'bg-secondary text-muted-foreground',
  },
};

export function POSTablesContent({ restaurantId, tables, orders }: POSTablesContentProps) {
  const router = useRouter();

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.table_id === tableId);
  };

  const handleTableClick = async (table: Table) => {
    const existingOrder = getTableOrder(table.id);

    if (existingOrder) {
      router.push(`/pos/orders/${existingOrder.id}`);
    } else {
      // Create new order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: table.id, restaurantId }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/pos/orders/${data.order.id}`);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif">Mesas</h1>
        <p className="text-muted-foreground mt-2">
          {tables.filter((t) => t.status === 'available').length} de {tables.length} disponibles
        </p>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table, index) => {
          const order = getTableOrder(table.id);
          const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;

          return (
            <motion.button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={cn(
                'group relative rounded-2xl border-2 p-6 text-left transition-all',
                'hover:border-primary hover:shadow-lg',
                table.status === 'available' ? 'border-border' : 'border-primary/20'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Table number - large and prominent */}
              <div className="mb-4">
                <span className="font-serif text-3xl">{table.number}</span>
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                  config.className
                )}
              >
                {config.label}
              </div>

              {/* Order info if occupied */}
              {order && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="size-4" />
                    <span>{formatTime(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Receipt className="size-4" />
                    <span>€{(order.subtotal_cents / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Capacity */}
              <div className="text-muted-foreground absolute top-4 right-4 flex items-center gap-1">
                <Users className="size-4" />
                <span className="text-sm">{table.capacity}</span>
              </div>

              {/* Add icon for available tables */}
              {table.status === 'available' && (
                <div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <Plus className="size-5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">No hay mesas configuradas</div>
      )}
    </div>
  );
}
