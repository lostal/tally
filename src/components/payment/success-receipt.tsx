'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { Check, Download, Share2 } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  amountCents: number;
}

interface SuccessReceiptProps {
  /** Restaurant name */
  restaurantName: string;
  /** Table number */
  tableNumber: string;
  /** Receipt number */
  receiptNumber: string;
  /** Items paid for */
  items: ReceiptItem[];
  /** Subtotal in cents */
  subtotalCents: number;
  /** Tip in cents */
  tipCents: number;
  /** Total paid in cents */
  totalCents: number;
  /** Currency */
  currency?: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Payment time */
  paidAt: Date;
  /** Callback to go back/dismiss */
  onDone?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SuccessReceipt - Animated payment success screen
 *
 * Shows celebratory animation and receipt details.
 */
export function SuccessReceipt({
  restaurantName,
  tableNumber,
  receiptNumber,
  items,
  subtotalCents,
  tipCents,
  totalCents,
  currency = 'EUR',
  paidAt,
  onDone,
  className,
}: SuccessReceiptProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Success animation */}
      <motion.div
        className="flex flex-col items-center py-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="bg-success flex size-20 items-center justify-center rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Check className="size-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1
          className="mt-6 text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ¡Pago completado!
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Gracias por visitarnos
        </motion.p>
      </motion.div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{restaurantName}</h2>
                <p className="text-muted-foreground text-sm">Mesa {tableNumber}</p>
              </div>
              <StatusBadge variant="success">Pagado</StatusBadge>
            </div>

            <Separator className="my-4" />

            {/* Items */}
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    {item.name}
                    {item.quantity > 1 && ` ×${item.quantity}`}
                  </span>
                  <CurrencyDisplay
                    amountCents={item.amountCents}
                    currency={currency}
                    animated={false}
                  />
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <CurrencyDisplay amountCents={subtotalCents} currency={currency} animated={false} />
              </div>
              {tipCents > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Propina</span>
                  <CurrencyDisplay amountCents={tipCents} currency={currency} animated={false} />
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Total pagado</span>
                <CurrencyDisplay
                  amountCents={totalCents}
                  currency={currency}
                  size="lg"
                  animated={false}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Receipt info */}
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Recibo #{receiptNumber}</span>
              <span>
                {paidAt.toLocaleDateString()}{' '}
                {paidAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button variant="outline" className="flex-1 gap-2 rounded-xl">
          <Download className="size-4" />
          Guardar
        </Button>
        <Button variant="outline" className="flex-1 gap-2 rounded-xl">
          <Share2 className="size-4" />
          Compartir
        </Button>
      </motion.div>

      {/* Done button */}
      {onDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Button onClick={onDone} className="w-full rounded-2xl" size="lg">
            Hecho
          </Button>
        </motion.div>
      )}
    </div>
  );
}
