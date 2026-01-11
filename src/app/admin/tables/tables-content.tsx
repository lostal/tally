'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, QrCode, Users, Loader2, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
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

export function TablesContent({ restaurantSlug, tables: initialTables }: TablesContentProps) {
  const router = useRouter();
  const [tables, setTables] = React.useState(initialTables);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQR, setShowQR] = React.useState<string | null>(null);

  // Modal state
  const [tableModal, setTableModal] = React.useState<{ open: boolean; table?: Table }>({
    open: false,
  });
  const [tableForm, setTableForm] = React.useState({ number: '', capacity: '4' });

  const openTableModal = (table?: Table) => {
    setTableForm({
      number: table?.number || '',
      capacity: table?.capacity?.toString() || '4',
    });
    setTableModal({ open: true, table });
  };

  const handleSaveTable = async () => {
    if (!tableForm.number.trim()) return;
    setIsLoading(true);

    if (tableModal.table) {
      // Edit
      await fetch(`/api/restaurants/${restaurantSlug}/tables`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableModal.table.id,
          number: tableForm.number.trim(),
          capacity: parseInt(tableForm.capacity) || 4,
        }),
      });
    } else {
      // Create
      await fetch(`/api/restaurants/${restaurantSlug}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: tableForm.number.trim(),
          capacity: parseInt(tableForm.capacity) || 4,
        }),
      });
    }

    setTableModal({ open: false });
    setIsLoading(false);
    router.refresh();
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('¿Eliminar esta mesa?')) return;
    await fetch(`/api/restaurants/${restaurantSlug}/tables?id=${tableId}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    // Optimistic update
    setTables(
      tables.map((t) => (t.id === tableId ? { ...t, status: newStatus as Table['status'] } : t))
    );

    await fetch(`/api/restaurants/${restaurantSlug}/tables`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, status: newStatus }),
    });
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
        <Button onClick={() => openTableModal()}>
          <Plus className="mr-2 size-4" />
          Nueva mesa
        </Button>
      </motion.div>

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

            {/* Actions - Always visible */}
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
              <Button size="sm" variant="outline" onClick={() => openTableModal(table)}>
                <Pencil className="size-4" />
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

      {/* Table Modal */}
      <Modal
        open={tableModal.open}
        onClose={() => setTableModal({ open: false })}
        title={tableModal.table ? 'Editar mesa' : 'Nueva mesa'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número/Nombre</label>
            <input
              type="text"
              value={tableForm.number}
              onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
              placeholder="Ej: 7, Terraza 1"
              autoFocus
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacidad</label>
            <input
              type="number"
              value={tableForm.capacity}
              onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
              min="1"
              className="border-input bg-background w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTableModal({ open: false })}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTable} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
