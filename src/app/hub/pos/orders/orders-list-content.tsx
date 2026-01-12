'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Table2, Clock, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersListContentProps {
  orders: Array<{
    id: string;
    table_id: string;
    tables: { number: string } | null;
    status: string;
    subtotal_cents: number;
    created_at: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  served: 'bg-green-500/20 text-green-700 dark:text-green-400',
  paying: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  served: 'Servido',
  paying: 'Pagando',
};

export function OrdersListContent({ orders }: OrdersListContentProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos Activos</h1>

      <div className="space-y-3">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/pos/orders/${order.id}`}
              className="bg-card hover:bg-accent flex items-center justify-between rounded-xl border p-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-secondary flex size-12 items-center justify-center rounded-xl">
                  <Table2 className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    Mesa {(order.tables as { number: string } | null)?.number || '?'}
                  </p>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="size-3" />
                    <span>
                      {formatDate(order.created_at)} · {formatTime(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="flex items-center gap-1 font-semibold">
                    <Receipt className="size-4" />€{(order.subtotal_cents / 100).toFixed(2)}
                  </p>
                  <span
                    className={cn('rounded-full px-2 py-0.5 text-xs', STATUS_COLORS[order.status])}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">No hay pedidos activos</div>
        )}
      </div>
    </div>
  );
}
