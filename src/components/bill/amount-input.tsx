'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface AmountInputProps {
  /** Current amount in cents */
  valueCents: number;
  /** Callback when amount changes */
  onChange: (cents: number) => void;
  /** Total bill in cents (for validation/display) */
  billTotalCents?: number;
  /** Remaining amount in cents (what others haven't claimed) */
  remainingCents?: number;
  /** Currency code */
  currency?: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Additional CSS classes */
  className?: string;
}

const QUICK_AMOUNTS = [500, 1000, 1500, 2000, 2500]; // in cents

/**
 * AmountInput - Custom amount input for fixed amount split
 *
 * Allows users to enter a specific amount they want to pay.
 * Includes quick-select buttons for common amounts.
 */
export function AmountInput({
  valueCents,
  onChange,
  billTotalCents,
  remainingCents,
  currency: _currency = 'EUR',
  className,
}: AmountInputProps) {
  const [inputValue, setInputValue] = React.useState(
    valueCents > 0 ? (valueCents / 100).toFixed(2) : ''
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Parse and convert to cents
    const parsed = parseFloat(raw.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(Math.round(parsed * 100));
    } else if (raw === '') {
      onChange(0);
    }
  };

  const handleQuickAmount = (cents: number) => {
    onChange(cents);
    setInputValue((cents / 100).toFixed(2));
  };

  const handlePayRemaining = () => {
    if (remainingCents) {
      onChange(remainingCents);
      setInputValue((remainingCents / 100).toFixed(2));
    }
  };

  const isOverpaying = remainingCents !== undefined && valueCents > remainingCents;

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Introduce el importe
      </h2>

      {/* Main input */}
      <div className="relative">
        <span className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-bold">
          €
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="0.00"
          className={cn(
            'h-16 rounded-2xl pl-10 text-center text-3xl font-bold tabular-nums',
            isOverpaying && 'border-destructive ring-destructive'
          )}
        />
      </div>

      {/* Validation message */}
      {isOverpaying && (
        <p className="text-destructive text-center text-sm">El importe supera el restante</p>
      )}

      {/* Quick amount buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((cents) => (
          <Button
            key={cents}
            variant={valueCents === cents ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickAmount(cents)}
            className="flex-1 rounded-xl"
          >
            €{(cents / 100).toFixed(0)}
          </Button>
        ))}
      </div>

      {/* Pay remaining button */}
      {remainingCents && remainingCents > 0 && (
        <Button variant="secondary" onClick={handlePayRemaining} className="w-full rounded-xl">
          Pagar restante{' '}
          <CurrencyDisplay amountCents={remainingCents} animated={false} className="ml-1" />
        </Button>
      )}

      {/* Bill total reference */}
      {billTotalCents && (
        <p className="text-muted-foreground text-center text-sm">
          Total cuenta: <CurrencyDisplay amountCents={billTotalCents} animated={false} />
        </p>
      )}
    </div>
  );
}
