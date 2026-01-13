'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Delete, RotateCcw, Loader2, X, QrCode, Hash, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createEssentialOrder } from '@/app/actions/essential-order';
import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';
import { springSnappy, springBouncy, springSmooth } from '@/lib/motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface KeypadPremiumProps {
  restaurantId: string;
  slug: string;
}

// Keypad button component with haptic-like feedback
function KeypadButton({
  children,
  onClick,
  variant = 'number',
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'action' | 'primary' | 'danger';
  className?: string;
  disabled?: boolean;
}) {
  const baseStyles = cn(
    'relative flex items-center justify-center',
    'rounded-2xl font-semibold transition-colors',
    'active:scale-95 transition-transform duration-100',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
    'overflow-hidden'
  );

  const variantStyles = {
    number: 'bg-card border-2 border-border text-foreground hover:bg-accent h-16 text-2xl',
    action:
      'bg-secondary/50 border-2 border-border text-muted-foreground hover:bg-secondary h-14 text-sm',
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 h-14 text-lg',
    danger:
      'bg-destructive/10 border-2 border-destructive/30 text-destructive hover:bg-destructive/20 h-14',
  };

  return (
    <motion.button
      type="button"
      className={cn(baseStyles, variantStyles[variant], className)}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      transition={springSnappy}
    >
      {/* Ripple effect */}
      <span className="pointer-events-none absolute inset-0">
        <span className="bg-foreground/5 absolute inset-0 opacity-0 transition-opacity active:opacity-100" />
      </span>
      {children}
    </motion.button>
  );
}

// Amount display with currency animation
function AmountDisplay({ amount }: { amount: string }) {
  const digits = amount.split('');

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="bg-primary/5 absolute inset-0 rounded-full blur-3xl" />

      <motion.div className="relative flex items-baseline justify-center gap-1" layout>
        <span className="text-muted-foreground text-3xl font-medium">€</span>
        <AnimatePresence mode="popLayout">
          {digits.map((digit, index) => (
            <motion.span
              key={`${index}-${digit}`}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={springBouncy}
              className="font-serif text-6xl font-bold tabular-nums"
            >
              {digit}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Table selector pill
function TableSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2.5',
          'bg-secondary/50 border-border border-2',
          'hover:bg-secondary transition-colors'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <Hash className="text-muted-foreground size-4" />
        <span className="font-medium">Mesa {value}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className={cn(
                'absolute top-full left-0 z-50 mt-2',
                'bg-card border-border rounded-2xl border-2 shadow-xl',
                'max-h-60 w-64 overflow-y-auto p-3'
              )}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={springSnappy}
            >
              <div className="grid grid-cols-4 gap-2">
                {tables.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChange(t);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'h-10 rounded-lg font-medium transition-colors',
                      value === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Concept/Description input
function ConceptInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (isEditing) {
    return (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          placeholder="Concepto..."
          autoFocus
          className={cn(
            'w-full rounded-xl px-4 py-2.5',
            'bg-secondary/50 border-primary border-2',
            'placeholder:text-muted-foreground text-sm font-medium',
            'focus:outline-none'
          )}
        />
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5',
        'bg-secondary/50 border-border border-2',
        'hover:bg-secondary transition-colors'
      )}
      whileTap={{ scale: 0.95 }}
    >
      <FileText className="text-muted-foreground size-4" />
      <span
        className={cn('max-w-30 truncate text-sm font-medium', !value && 'text-muted-foreground')}
      >
        {value || 'Añadir concepto'}
      </span>
    </motion.button>
  );
}

// QR Dialog Premium
function QRDialogPremium({
  isOpen,
  onClose,
  amount,
  table,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  table: string;
  url: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springBouncy}
          >
            <DialogTitle className="text-center font-serif text-4xl font-bold">
              € {amount}
            </DialogTitle>
          </motion.div>
          <DialogDescription className="text-center">
            Mesa {table} · Escanea para pagar
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="flex justify-center py-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, ...springSmooth }}
        >
          <div className="relative">
            {/* Decorative frame */}
            <div className="border-primary/30 absolute -inset-4 rounded-3xl border-2 border-dashed" />

            {/* QR Container */}
            <div className="relative rounded-2xl bg-white p-5 shadow-xl">
              <QRCode value={url} size={200} level="H" />
            </div>

            {/* Corner accents */}
            <div className="border-primary absolute -top-2 -left-2 size-4 rounded-tl border-t-2 border-l-2" />
            <div className="border-primary absolute -top-2 -right-2 size-4 rounded-tr border-t-2 border-r-2" />
            <div className="border-primary absolute -bottom-2 -left-2 size-4 rounded-bl border-b-2 border-l-2" />
            <div className="border-primary absolute -right-2 -bottom-2 size-4 rounded-br border-r-2 border-b-2" />
          </div>
        </motion.div>

        <DialogFooter className="sm:justify-center">
          <Button variant="secondary" onClick={onClose} className="gap-2">
            <X className="size-4" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * KeypadPremium - Premium keypad for Essential Plan
 *
 * Features:
 * - Animated amount display
 * - Haptic-like button feedback
 * - Smooth transitions
 * - Premium QR dialog
 */
export function KeypadPremium({ restaurantId, slug }: KeypadPremiumProps) {
  const [amount, setAmount] = React.useState<string>('0');
  const [description, setDescription] = React.useState('');
  const [tableNumber, setTableNumber] = React.useState<string>('1');
  const [isProcessing, setIsProcessing] = React.useState(false);

  // QR State
  const [showQR, setShowQR] = React.useState(false);
  const [chargeDetails, setChargeDetails] = React.useState<{
    amount: string;
    table: string;
  } | null>(null);

  const handleNumberClick = (num: string) => {
    setAmount((prev) => {
      if (prev === '0' && num !== '.') return num;
      if (num === '.' && prev.includes('.')) return prev;
      // Limit: 9999.99
      const parts = prev.split('.');
      if (parts[0].length >= 4 && !prev.includes('.') && num !== '.') return prev;
      if (parts[1]?.length >= 2) return prev;
      return prev + num;
    });
  };

  const handleBackspace = () => {
    setAmount((prev) => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setAmount('0');
    setDescription('');
  };

  const handleCharge = async () => {
    const value = parseFloat(amount);
    if (value <= 0) {
      toast.error('Introduce un monto válido');
      return;
    }

    if (!tableNumber) {
      toast.error('Selecciona una mesa');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Generando cobro...');

    try {
      const res = await createEssentialOrder({
        restaurantId,
        tableNumber,
        amount: Math.round(value * 100),
        description: description || 'Pago Rápido',
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success('Cobro generado', { id: toastId });

      // Show QR
      setChargeDetails({ amount, table: tableNumber });
      setShowQR(true);

      // Reset
      handleClear();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el cobro', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const getQrUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/go/${slug}?table=${chargeDetails?.table}`;
  };

  const canCharge = parseFloat(amount) > 0 && !isProcessing;

  return (
    <motion.div
      className="mx-auto w-full max-w-sm px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSmooth}
    >
      {/* Header */}
      <div className="mb-2 text-center">
        <motion.div
          className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <QrCode className="size-4" />
          Cobro Rápido
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        className="bg-card border-border overflow-hidden rounded-3xl border-2 shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, ...springSmooth }}
      >
        {/* Amount Display */}
        <div className="px-6 pt-8 pb-6">
          <AmountDisplay amount={amount} />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-center gap-3 px-4 pb-4">
          <TableSelector value={tableNumber} onChange={setTableNumber} />
          <ConceptInput value={description} onChange={setDescription} />
        </div>

        {/* Keypad Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <KeypadButton
                key={num}
                variant="number"
                onClick={() => handleNumberClick(num.toString())}
              >
                {num}
              </KeypadButton>
            ))}

            <KeypadButton
              variant="number"
              onClick={() => handleNumberClick('.')}
              className="text-xl"
            >
              ,
            </KeypadButton>

            <KeypadButton variant="number" onClick={() => handleNumberClick('0')}>
              0
            </KeypadButton>

            <KeypadButton variant="number" onClick={handleBackspace} className="text-base">
              <Delete className="size-6" />
            </KeypadButton>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-5 gap-2.5 px-4 pb-4">
          <KeypadButton variant="action" onClick={handleClear} className="col-span-2">
            <RotateCcw className="mr-2 size-4" />
            Borrar
          </KeypadButton>

          <KeypadButton
            variant="primary"
            onClick={handleCharge}
            disabled={!canCharge}
            className={cn('col-span-3', !canCharge && 'cursor-not-allowed opacity-50')}
          >
            {isProcessing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Cobrar
                <ArrowRight className="ml-2 size-5" />
              </>
            )}
          </KeypadButton>
        </div>

        {/* Footer hint */}
        <div className="border-border bg-secondary/30 border-t px-4 py-3">
          <p className="text-muted-foreground text-center text-xs">
            Se generará un código QR para que el cliente pague
          </p>
        </div>
      </motion.div>

      {/* QR Dialog */}
      <QRDialogPremium
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        amount={chargeDetails?.amount || '0'}
        table={chargeDetails?.table || '1'}
        url={getQrUrl()}
      />
    </motion.div>
  );
}
