'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, QrCode, Users, Loader2, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Table } from '@/types/database';
import { getAppUrl } from '@/lib/url';

interface TablesContentProps {
  restaurantId: string;
  restaurantSlug: string;
  tables: Table[];
}

// Status styles matching Design System (src/app/page.tsx)
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    containerClass: string;
    dotClass: string;
    mutedTextClass: string;
    selectClass?: string;
    actionButtonClass?: string;
    actionButtonGhostClass?: string;
  }
> = {
  available: {
    label: 'Libre',
    containerClass: 'border-border bg-background',
    dotClass: 'bg-emerald-500',
    mutedTextClass: 'text-muted-foreground',
  },
  occupied: {
    label: 'Ocupada',
    containerClass: 'border-primary bg-primary text-primary-foreground shadow-lg',
    dotClass: 'bg-amber-400',
    mutedTextClass: 'text-primary-foreground/80',
    selectClass:
      'bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 hover:bg-primary-foreground/20 focus:ring-primary-foreground/50',
    actionButtonClass:
      'border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary',
    actionButtonGhostClass:
      'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground',
  },
  paying: {
    label: 'Pagando',
    containerClass: 'border-muted bg-muted/30',
    dotClass: 'bg-blue-500',
    mutedTextClass: 'text-muted-foreground',
  },
  reserved: {
    label: 'Reservada',
    containerClass: 'border-border border-dashed bg-secondary/50',
    dotClass: 'bg-orange-500',
    mutedTextClass: 'text-muted-foreground',
  },
};

export function TablesContent({ restaurantSlug, tables: initialTables }: TablesContentProps) {
  const router = useRouter();
  const [tables, setTables] = React.useState(initialTables);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQR, setShowQR] = React.useState<string | null>(null);

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
      await fetch(`/api/restaurants/${restaurantSlug}/tables`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableModal.table.id,
          number: tableForm.number,
          capacity: parseInt(tableForm.capacity),
        }),
      });
    } else {
      await fetch(`/api/restaurants/${restaurantSlug}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: tableForm.number,
          capacity: parseInt(tableForm.capacity),
        }),
      });
    }

    router.refresh();
    setTableModal({ open: false });
    setIsLoading(false);
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta mesa?')) return;
    setIsLoading(true);
    await fetch(`/api/restaurants/${restaurantSlug}/tables?id=${tableId}`, {
      method: 'DELETE',
    });
    setTables(tables.filter((t) => t.id !== tableId));
    setIsLoading(false);
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
    const baseUrl = getAppUrl('go');
    return `${baseUrl}/${restaurantSlug}?table=${tableNumber}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="font-serif">Mesas</h1>
          <p className="text-muted-foreground mt-2">{tables.length} mesas configuradas</p>
        </div>
        <Button onClick={() => openTableModal()} size="lg">
          <Plus className="mr-2 size-4" />
          Nueva mesa
        </Button>
      </motion.div>

      {/* Tables grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table, index) => {
          const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;

          return (
            <motion.div
              key={table.id}
              className={cn(
                'space-y-4 rounded-2xl border-2 p-6 transition-all duration-300',
                config.containerClass
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl">Mesa {table.number}</h3>
                  <div
                    className={cn('mt-1 flex items-center gap-2 text-sm', config.mutedTextClass)}
                  >
                    <Users className="size-4" />
                    <span>{table.capacity} personas</span>
                  </div>
                </div>
                <div className={cn('size-3 rounded-full shadow-sm', config.dotClass)} />
              </div>

              {/* Status selector - using accessible standard select */}
              <Select
                value={table.status}
                onValueChange={(value) => handleStatusChange(table.id, value)}
              >
                <SelectTrigger className={cn('w-full', config.selectClass)}>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={cn('flex-1', config.actionButtonClass)}
                  onClick={() => setShowQR(showQR === table.id ? null : table.id)}
                >
                  <QrCode className="mr-1 size-4" />
                  QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(config.actionButtonClass)}
                  asChild
                >
                  <a href={getQRUrl(table.number)} target="_blank" rel="noopener">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(config.actionButtonClass)}
                  onClick={() => openTableModal(table)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'text-destructive/70 hover:bg-destructive/10 hover:text-destructive',
                    config.actionButtonGhostClass
                  )}
                  onClick={() => handleDeleteTable(table.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    height: showQR === table.id ? 'auto' : 0,
                    opacity: showQR === table.id ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="bg-secondary mt-4 rounded-xl p-4 text-center">
                    <p className="text-muted-foreground text-xs break-all">
                      {getQRUrl(table.number)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}

        {tables.length === 0 && (
          <div className="text-muted-foreground col-span-full py-16 text-center">
            No hay mesas. Añade tu primera mesa.
          </div>
        )}
      </div>

      {/* Modal */}
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
              className="border-border bg-background w-full rounded-xl border-2 px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacidad</label>
            <input
              type="number"
              value={tableForm.capacity}
              onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
              min="1"
              className="border-border bg-background w-full rounded-xl border-2 px-4 py-3"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
