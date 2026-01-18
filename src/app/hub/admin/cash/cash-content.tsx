'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Plus,
  Minus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { springSmooth, springSnappy } from '@/lib/motion';
import type { ZReport } from '@/types/cash';

// ============================================
// Types
// ============================================

interface Transaction {
  id: string;
  type: 'entry' | 'exit';
  amount_cents: number;
  reason: string;
  notes: string | null;
  created_at: string;
  user: { name: string } | null;
}

interface Register {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opening_amount_cents: number;
  expected_cash_cents: number | null;
  actual_cash_cents: number | null;
  difference_cents: number | null;
  z_report: ZReport | null;
  openedByUser?: { name: string } | null;
  closedByUser?: { name: string } | null;
}

interface CashContentProps {
  currentRegister: Register | null;
  transactions: Transaction[];
  recentRegisters: Register[];
}

// ============================================
// Format Helpers
// ============================================

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// Sub-Components
// ============================================

function OpenRegisterModal({
  onOpen,
  onClose,
}: {
  onOpen: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cents = Math.round(parseFloat(amount || '0') * 100);
    await onOpen(cents);
    setIsLoading(false);
  };

  return (
    <motion.div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border-border w-full max-w-md rounded-2xl border-2 p-6 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={springSnappy}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">Abrir Caja</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm">
              Importe inicial (efectivo en caja)
            </label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                €
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-lg"
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Abriendo...' : 'Abrir Caja'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TransactionModal({
  type,
  onAdd,
  onClose,
}: {
  type: 'entry' | 'exit';
  onAdd: (amount: number, reason: string, notes?: string) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const isEntry = type === 'entry';
  const quickReasons = isEntry
    ? ['Cambio del banco', 'Fondo de caja', 'Otro']
    : ['Propina repartidor', 'Compra material', 'Pago proveedor', 'Otro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsLoading(true);
    const cents = Math.round(parseFloat(amount || '0') * 100);
    await onAdd(cents, reason.trim(), notes.trim() || undefined);
    setIsLoading(false);
  };

  return (
    <motion.div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border-border w-full max-w-md rounded-2xl border-2 p-6 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={springSnappy}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">
            {isEntry ? 'Entrada de Efectivo' : 'Salida de Efectivo'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm">Importe</label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                €
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-lg"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-sm">Motivo</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    reason === r
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo..."
              required
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-sm">Notas (opcional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className={cn(
                'flex-1',
                isEntry ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              )}
              disabled={isLoading || !reason.trim() || !amount}
            >
              {isLoading ? 'Guardando...' : isEntry ? 'Añadir Entrada' : 'Añadir Salida'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CloseRegisterModal({
  expectedAmount,
  onClose,
  onConfirm,
}: {
  expectedAmount: number;
  onClose: () => void;
  onConfirm: (actualAmount: number) => void;
}) {
  const [amount, setAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const actualCents = Math.round(parseFloat(amount || '0') * 100);
  const difference = actualCents - expectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onConfirm(actualCents);
    setIsLoading(false);
  };

  return (
    <motion.div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border-border w-full max-w-md rounded-2xl border-2 p-6 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={springSnappy}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">Cerrar Caja</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-muted-foreground text-sm">Efectivo esperado</p>
            <p className="font-serif text-2xl font-bold">{formatCurrency(expectedAmount)}</p>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-sm">
              Efectivo contado (real en caja)
            </label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                €
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-lg"
                autoFocus
                required
              />
            </div>
          </div>

          {amount && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl p-4',
                difference === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950'
                  : difference > 0
                    ? 'bg-blue-50 dark:bg-blue-950'
                    : 'bg-red-50 dark:bg-red-950'
              )}
            >
              <div className="flex items-center gap-2">
                {difference === 0 ? (
                  <CheckCircle2 className="size-5 text-emerald-600" />
                ) : difference > 0 ? (
                  <TrendingUp className="size-5 text-blue-600" />
                ) : (
                  <AlertTriangle className="size-5 text-red-600" />
                )}
                <span className="font-medium">
                  {difference === 0
                    ? 'Cuadre perfecto'
                    : difference > 0
                      ? `Sobrante: ${formatCurrency(difference)}`
                      : `Faltante: ${formatCurrency(Math.abs(difference))}`}
                </span>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !amount}>
              {isLoading ? 'Cerrando...' : 'Cerrar y Generar Z'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ZReportModal({ register, onClose }: { register: Register; onClose: () => void }) {
  const report = register.z_report;
  if (!report) return null;

  return (
    <motion.div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border-border w-full max-w-lg rounded-2xl border-2 p-6 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={springSnappy}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <FileText className="text-primary size-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Informe Z</h2>
              <p className="text-muted-foreground text-sm">{formatDateTime(report.period.end)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Period */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-muted-foreground mb-1 text-sm">Período</p>
            <p className="text-sm">
              {formatDateTime(report.period.start)} → {formatDateTime(report.period.end)}
            </p>
          </div>

          {/* Sales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm">Tarjeta</span>
              </div>
              <p className="font-serif text-xl font-bold">
                {formatCurrency(report.sales.card.totalCents)}
              </p>
              <p className="text-muted-foreground text-xs">{report.sales.card.count} pagos</p>
            </div>
            <div className="border-border rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <DollarSign className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm">Propinas</span>
              </div>
              <p className="font-serif text-xl font-bold">
                {formatCurrency(report.tips.totalCents)}
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted-foreground mb-3 text-sm font-medium">Movimientos de Caja</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Apertura</span>
                <span>{formatCurrency(report.openingAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>+ Entradas ({report.transactions.entries})</span>
                <span>{formatCurrency(report.transactions.entriesCents)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>− Salidas ({report.transactions.exits})</span>
                <span>{formatCurrency(report.transactions.exitsCents)}</span>
              </div>
              <div className="border-border border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Efectivo esperado</span>
                  <span>{formatCurrency(register.expected_cash_cents ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Balance */}
          <div
            className={cn(
              'rounded-xl p-4',
              register.difference_cents === 0
                ? 'bg-emerald-50 dark:bg-emerald-950'
                : register.difference_cents! > 0
                  ? 'bg-blue-50 dark:bg-blue-950'
                  : 'bg-red-50 dark:bg-red-950'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Contado</p>
                <p className="font-serif text-2xl font-bold">
                  {formatCurrency(register.actual_cash_cents ?? 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Diferencia</p>
                <p
                  className={cn(
                    'font-serif text-xl font-bold',
                    register.difference_cents === 0
                      ? 'text-emerald-600'
                      : register.difference_cents! > 0
                        ? 'text-blue-600'
                        : 'text-red-600'
                  )}
                >
                  {register.difference_cents === 0
                    ? '✓ Cuadre'
                    : register.difference_cents! > 0
                      ? `+${formatCurrency(register.difference_cents!)}`
                      : formatCurrency(register.difference_cents!)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Main Component
// ============================================

export function CashContent({
  currentRegister: initialRegister,
  transactions: initialTransactions,
  recentRegisters,
}: CashContentProps) {
  const [register, setRegister] = React.useState(initialRegister);
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [showOpenModal, setShowOpenModal] = React.useState(false);
  const [showTransactionModal, setShowTransactionModal] = React.useState<'entry' | 'exit' | null>(
    null
  );
  const [showCloseModal, setShowCloseModal] = React.useState(false);
  const [showZReport, setShowZReport] = React.useState<Register | null>(null);

  // Calculate current cash in register
  const currentCash = React.useMemo(() => {
    if (!register) return 0;
    let total = register.opening_amount_cents;
    for (const tx of transactions) {
      total += tx.type === 'entry' ? tx.amount_cents : -tx.amount_cents;
    }
    return total;
  }, [register, transactions]);

  // Handlers
  const handleOpenRegister = async (openingAmount: number) => {
    const res = await fetch('/api/cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openingAmountCents: openingAmount }),
    });
    const data = await res.json();
    if (data.success) {
      setRegister(data.register);
      setTransactions([]);
      setShowOpenModal(false);
    }
  };

  const handleAddTransaction = async (amount: number, reason: string, notes?: string) => {
    const res = await fetch('/api/cash/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: showTransactionModal,
        amountCents: amount,
        reason,
        notes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTransactions((prev) => [data.transaction, ...prev]);
      setShowTransactionModal(null);
    }
  };

  const handleCloseRegister = async (actualAmount: number) => {
    const res = await fetch('/api/cash/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualCashCents: actualAmount }),
    });
    const data = await res.json();
    if (data.success) {
      setShowZReport(data.register);
      setRegister(null);
      setTransactions([]);
      setShowCloseModal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
      >
        <div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Gestión de Caja</p>
          <h1 className="font-serif text-3xl font-bold">Control de Efectivo</h1>
        </div>
        {register && (
          <Badge className="bg-emerald-500/10 text-emerald-600">
            <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
            Caja Abierta
          </Badge>
        )}
      </motion.div>

      {/* No Register Open */}
      {!register && (
        <motion.div
          className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springSmooth}
        >
          <Wallet className="text-muted-foreground mb-4 size-12" />
          <h2 className="font-serif text-xl font-bold">No hay caja abierta</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Abre la caja para comenzar a registrar movimientos
          </p>
          <Button size="lg" onClick={() => setShowOpenModal(true)}>
            <Plus className="mr-2 size-4" />
            Abrir Caja
          </Button>
        </motion.div>
      )}

      {/* Register Open */}
      {register && (
        <>
          {/* Current Balance */}
          <motion.div
            className="bg-primary text-primary-foreground overflow-hidden rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...springSmooth }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm">Efectivo actual en caja</p>
                <p className="font-serif text-5xl font-bold">{formatCurrency(currentCash)}</p>
                <p className="text-primary-foreground/60 mt-2 text-sm">
                  Abierta por {register.openedByUser?.name} a las {formatTime(register.opened_at)}
                </p>
              </div>
              <div className="bg-primary-foreground/10 flex size-14 items-center justify-center rounded-full">
                <Wallet className="size-7" />
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid gap-3 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...springSmooth }}
          >
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
              onClick={() => setShowTransactionModal('entry')}
            >
              <Plus className="mr-2 size-4 text-emerald-600" />
              Entrada
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-red-200 hover:border-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              onClick={() => setShowTransactionModal('exit')}
            >
              <Minus className="mr-2 size-4 text-red-600" />
              Salida
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowCloseModal(true)}>
              <FileText className="mr-2 size-4" />
              Cerrar Caja
            </Button>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground size-4" />
              <h3 className="font-serif text-lg font-medium">Movimientos del turno</h3>
            </div>

            {transactions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No hay movimientos registrados
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    className="border-border flex items-center justify-between rounded-xl border p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-full',
                          tx.type === 'entry'
                            ? 'bg-emerald-100 dark:bg-emerald-900'
                            : 'bg-red-100 dark:bg-red-900'
                        )}
                      >
                        {tx.type === 'entry' ? (
                          <TrendingUp className="size-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="size-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.reason}</p>
                        <p className="text-muted-foreground text-xs">
                          {tx.user?.name} · {formatTime(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        'font-serif text-lg font-bold',
                        tx.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {tx.type === 'entry' ? '+' : '−'}
                      {formatCurrency(tx.amount_cents)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Recent Closures */}
      {recentRegisters.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-serif text-lg font-medium">Cierres recientes</h3>
          <div className="space-y-2">
            {recentRegisters.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setShowZReport(reg)}
                className="border-border hover:border-primary flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors"
              >
                <div>
                  <p className="font-medium">{formatDateTime(reg.closed_at!)}</p>
                  <p className="text-muted-foreground text-xs">por {reg.closedByUser?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold">
                    {formatCurrency(reg.actual_cash_cents ?? 0)}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      reg.difference_cents === 0
                        ? 'text-emerald-600'
                        : reg.difference_cents! > 0
                          ? 'text-blue-600'
                          : 'text-red-600'
                    )}
                  >
                    {reg.difference_cents === 0
                      ? 'Cuadre ✓'
                      : reg.difference_cents! > 0
                        ? `+${formatCurrency(reg.difference_cents!)}`
                        : formatCurrency(reg.difference_cents!)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showOpenModal && (
          <OpenRegisterModal onOpen={handleOpenRegister} onClose={() => setShowOpenModal(false)} />
        )}
        {showTransactionModal && (
          <TransactionModal
            type={showTransactionModal}
            onAdd={handleAddTransaction}
            onClose={() => setShowTransactionModal(null)}
          />
        )}
        {showCloseModal && register && (
          <CloseRegisterModal
            expectedAmount={currentCash}
            onClose={() => setShowCloseModal(false)}
            onConfirm={handleCloseRegister}
          />
        )}
        {showZReport && (
          <ZReportModal register={showZReport} onClose={() => setShowZReport(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
