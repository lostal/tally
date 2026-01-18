'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatModifierPrice } from '@/lib/pos/modifiers';

interface ModifierOption {
  id: string;
  name: string;
  priceCents: number;
  isRequired: boolean;
}

interface ModifierSelectorProps {
  productName: string;
  modifiers: ModifierOption[];
  onConfirm: (selected: ModifierOption[]) => void;
  onCancel: () => void;
}

/**
 * ModifierSelector Component
 *
 * Displays a dialog for selecting modifiers when adding a product to an order.
 * Supports required and optional modifiers with price display.
 */
export function ModifierSelector({
  productName,
  modifiers,
  onConfirm,
  onCancel,
}: ModifierSelectorProps) {
  // Pre-select required modifiers
  const [selected, setSelected] = useState<Set<string>>(
    new Set(modifiers.filter((m) => m.isRequired).map((m) => m.id))
  );

  const toggleModifier = (id: string, isRequired: boolean) => {
    // Can't deselect required modifiers
    if (isRequired) return;

    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleConfirm = () => {
    const selectedModifiers = modifiers.filter((m) => selected.has(m.id));
    onConfirm(selectedModifiers);
  };

  // Calculate total extra cost from selected modifiers
  const extrasTotal = modifiers
    .filter((m) => selected.has(m.id))
    .reduce((sum, m) => sum + m.priceCents, 0);

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{productName}</DialogTitle>
          <DialogDescription>Selecciona los modificadores para este producto</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {modifiers.map((modifier) => (
            <div
              key={modifier.id}
              className="bg-secondary hover:bg-secondary/80 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
              onClick={() => toggleModifier(modifier.id, modifier.isRequired)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selected.has(modifier.id)}
                  onCheckedChange={() => toggleModifier(modifier.id, modifier.isRequired)}
                  disabled={modifier.isRequired}
                />
                <div>
                  <p className="font-medium">{modifier.name}</p>
                  {modifier.isRequired && (
                    <p className="text-muted-foreground text-xs">Requerido</p>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold">
                {formatModifierPrice(modifier.priceCents)}
              </span>
            </div>
          ))}

          {modifiers.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No hay modificadores disponibles
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-semibold">Extras: €{(extrasTotal / 100).toFixed(2)}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Añadir</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
