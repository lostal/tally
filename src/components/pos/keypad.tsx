'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowRight, Delete, Eraser, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createEssentialOrder } from '@/app/actions/essential-order';
// import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';

interface KeypadProps {
  restaurantId: string;
  slug: string;
}

export function Keypad({ restaurantId, slug }: KeypadProps) {
  // const router = useRouter();
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

  // Quick table list (1-20) for Essential Plan demo
  // In a real app, this might come from fetching tables, but Essential implies simple setup.
  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  const handleNumberClick = (num: string) => {
    setAmount((prev) => {
      if (prev === '0') return num;
      // Prevent too many decimals? simpler to keep it string
      if (num === '.' && prev.includes('.')) return prev;
      // Limit length
      if (prev.replace('.', '').length > 6) return prev;
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
    toast.loading('Generando cobro...');

    try {
      const res = await createEssentialOrder({
        restaurantId,
        tableNumber,
        amount: Math.round(value * 100), // cents
        description: description || 'Pago Rápido',
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.dismiss();
      toast.success('Cobro generado correctamente');

      // Show QR Dialog
      setChargeDetails({ amount, table: tableNumber });
      setShowQR(true);

      // Reset form but keep table? Usually waiter charges multiple tables.
      // Let's reset amount but keep table for convenience? Or reset all.
      handleClear();
    } catch (error) {
      toast.dismiss();
      logger.error('keypad charge error', error);
      toast.error('Error al generar el cobro');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate QR URL
  // Construct the absolute URL. In production, use env var. In dev, localhost.
  // For relative paths, browser handles it, but scanning needs absolute.
  // We'll use window.location.origin if available, or a reliable base.
  const getQrUrl = () => {
    if (typeof window === 'undefined') return '';
    // URL: {origin}/go/{slug}/bill?table={tableNumber}
    // Note: The "go" app is usually on a subdomain or path. Based on router, it's /go/[slug].
    // PROJECT_STRUCTURE said: served at go.paytally.app. But we are in a monorepo structure?
    // src/app/go/[slug]/bill
    // Let's assume path-based for this MVP: /go/{slug}/bill?table={table}
    const baseUrl = window.location.origin;
    return `${baseUrl}/go/${slug}?table=${chargeDetails?.table}`;
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">€ {amount}</CardTitle>
          <CardDescription>Introduce el monto a cobrar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="table">Mesa</Label>
              <Select value={tableNumber} onValueChange={setTableNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Mesa" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t} value={t}>
                      Mesa {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Concepto</Label>
              <Input
                id="note"
                placeholder="Varios"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-16 text-2xl font-semibold"
                onClick={() => handleNumberClick(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-16 text-2xl"
              onClick={() => handleNumberClick('.')}
            >
              .
            </Button>
            <Button
              variant="outline"
              className="h-16 text-2xl font-semibold"
              onClick={() => handleNumberClick('0')}
            >
              0
            </Button>
            <Button variant="outline" className="h-16" onClick={handleBackspace}>
              <Delete className="size-6" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={handleClear} className="h-14">
              <Eraser className="mr-2 size-4" /> Borrar
            </Button>
            <Button className="h-14 text-lg" onClick={handleCharge} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Cobrar <ArrowRight className="ml-2 size-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="text-center sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">€ {chargeDetails?.amount}</DialogTitle>
            <DialogDescription className="text-center">
              Escanea para pagar (Mesa {chargeDetails?.table})
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            {showQR && (
              <div className="rounded-xl border bg-white p-4">
                <QRCode value={getQrUrl()} size={200} />
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="secondary" onClick={() => setShowQR(false)}>
              <X className="mr-2 size-4" /> Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
