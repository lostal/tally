'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Clock, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase';
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

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400',
  occupied: 'bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-400',
  paying: 'bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-400',
  reserved: 'bg-purple-500/20 border-purple-500/50 text-purple-700 dark:text-purple-400',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Libre',
  occupied: 'Ocupada',
  paying: 'Pagando',
  reserved: 'Reservada',
};

export function POSTablesContent({ restaurantId, tables, orders }: POSTablesContentProps) {
  const router = useRouter();

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.table_id === tableId);
  };

  const handleTableClick = async (table: Table) => {
    const existingOrder = getTableOrder(table.id);

    if (existingOrder) {
      // Go to order detail
      router.push(`/pos/orders/${existingOrder.id}`);
    } else if (table.status === 'available') {
      // Create new order
      const supabase = getClient();

      // Update table status
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', table.id);

      // Create order
      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantId,
          table_id: table.id,
          status: 'open',
          subtotal_cents: 0,
        })
        .select('id')
        .single();

      if (!error && newOrder) {
        router.push(`/pos/orders/${newOrder.id}`);
      } else {
        router.refresh();
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <div className="flex gap-2 text-sm">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn('size-3 rounded-full', STATUS_COLORS[status].split(' ')[0])} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tables.map((table, index) => {
          const order = getTableOrder(table.id);
          const hasOrder = !!order;

          return (
            <motion.button
              key={table.id}
              className={cn(
                'relative aspect-square rounded-2xl border-2 p-4 transition-all',
                'flex flex-col items-center justify-center gap-2',
                'hover:scale-105 active:scale-95',
                STATUS_COLORS[table.status]
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleTableClick(table)}
            >
              <span className="text-3xl font-bold">{table.number}</span>

              <div className="flex items-center gap-1 text-xs opacity-60">
                <Users className="size-3" />
                <span>{table.capacity}</span>
              </div>

              {hasOrder && (
                <>
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs">
                    <Clock className="size-3" />
                    <span>{formatTime(order.created_at)}</span>
                  </div>
                  <div className="absolute bottom-2 flex items-center gap-1 text-sm font-semibold">
                    <Receipt className="size-3" />
                    <span>€{(order.subtotal_cents / 100).toFixed(2)}</span>
                  </div>
                </>
              )}

              {table.status === 'available' && <Plus className="absolute size-8 opacity-30" />}
            </motion.button>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-muted-foreground py-12 text-center">No hay mesas configuradas</div>
      )}
    </div>
  );
}
