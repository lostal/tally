'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, QrCode, Users, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Table } from '@/types/database';

interface TablesContentProps {
  restaurantId: string;
  restaurantSlug: string;
  tables: Table[];
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500',
  occupied: 'bg-orange-500',
  paying: 'bg-blue-500',
  reserved: 'bg-purple-500',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  paying: 'Pagando',
  reserved: 'Reservada',
};

export function TablesContent({ restaurantId, restaurantSlug, tables }: TablesContentProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTable, setNewTable] = React.useState({ number: '', capacity: '4' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQR, setShowQR] = React.useState<string | null>(null);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.number.trim()) return;

    setIsLoading(true);
    const supabase = getClient();

    const { error } = await supabase.from('tables').insert({
      restaurant_id: restaurantId,
      number: newTable.number.trim(),
      capacity: parseInt(newTable.capacity) || 4,
      status: 'available',
      is_active: true,
    });

    if (!error) {
      setNewTable({ number: '', capacity: '4' });
      setIsAdding(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('¿Eliminar esta mesa?')) return;

    const supabase = getClient();
    await supabase.from('tables').delete().eq('id', tableId);
    router.refresh();
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    const supabase = getClient();
    await supabase.from('tables').update({ status: newStatus }).eq('id', tableId);
    router.refresh();
  };

  const getQRUrl = (tableNumber: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/${restaurantSlug}?table=${tableNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
          <p className="text-muted-foreground mt-1">{tables.length} mesas configuradas</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 size-4" />
          Nueva mesa
        </Button>
      </motion.div>

      {/* Add table form */}
      {isAdding && (
        <motion.form
          onSubmit={handleAddTable}
          className="bg-card space-y-4 rounded-2xl border p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold">Añadir nueva mesa</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Número/Nombre</label>
              <input
                type="text"
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                placeholder="Ej: 7, Terraza 1"
                autoFocus
                className="border-input bg-background w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacidad</label>
              <input
                type="number"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                min="1"
                className="border-input bg-background w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Añadir mesa
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        </motion.form>
      )}

      {/* Tables grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            className="bg-card space-y-4 rounded-2xl border p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">Mesa {table.number}</h3>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Users className="size-4" />
                  <span>{table.capacity} personas</span>
                </div>
              </div>
              <div className={cn('size-3 rounded-full', STATUS_COLORS[table.status])} />
            </div>

            {/* Status selector */}
            <select
              value={table.status}
              onChange={(e) => handleStatusChange(table.id, e.target.value)}
              className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setShowQR(showQR === table.id ? null : table.id)}
              >
                <QrCode className="mr-1 size-4" />
                QR
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={getQRUrl(table.number)} target="_blank" rel="noopener">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDeleteTable(table.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {/* QR Code display */}
            {showQR === table.id && (
              <div className="bg-secondary space-y-2 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-xs break-all">{getQRUrl(table.number)}</p>
                <p className="text-muted-foreground text-xs">Genera el QR con esta URL</p>
              </div>
            )}
          </motion.div>
        ))}

        {tables.length === 0 && (
          <div className="text-muted-foreground col-span-full py-12 text-center">
            No hay mesas configuradas. Añade tu primera mesa.
          </div>
        )}
      </div>
    </div>
  );
}
