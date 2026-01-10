'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { BillItemCard } from './bill-item-card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { SelectableOrderItem } from '@/types';

interface BillItemListProps {
  /** List of items */
  items: SelectableOrderItem[];
  /** Callback when item selection changes */
  onItemToggle: (itemId: string) => void;
  /** Callback when item quantity changes */
  onItemQuantityChange?: (itemId: string, quantity: number) => void;
  /** Selected item IDs (for controlled mode) */
  selectedIds?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * BillItemList - List of selectable bill items
 *
 * Shows all items on the bill with selection state.
 * Displays summary of selected total at the bottom.
 */
export function BillItemList({
  items,
  onItemToggle,
  onItemQuantityChange,
  selectedIds,
  className,
}: BillItemListProps) {
  // Calculate totals
  const selectedItems = items.filter((item) =>
    selectedIds ? selectedIds.includes(item.id) : item.isSelected
  );
  const selectedTotalCents = selectedItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.claimedQuantity,
    0
  );
  const totalItems = items.length;
  const selectedCount = selectedItems.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Selecciona tus productos
        </h2>
        <span className="text-muted-foreground text-sm">
          {selectedCount}/{totalItems}
        </span>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <BillItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            priceCents={item.unitPriceCents}
            quantity={item.quantity}
            isSelected={selectedIds ? selectedIds.includes(item.id) : item.isSelected}
            claimedQuantity={item.claimedQuantity}
            onToggle={() => onItemToggle(item.id)}
            onQuantityChange={
              onItemQuantityChange ? (qty) => onItemQuantityChange(item.id, qty) : undefined
            }
            isFullyClaimed={item.claimedBy.length >= item.quantity}
            index={index}
          />
        ))}
      </div>

      {/* Selected total */}
      {selectedCount > 0 && (
        <motion.div
          className="bg-secondary flex items-center justify-between rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-medium">Tu selección</span>
          <CurrencyDisplay amountCents={selectedTotalCents} size="lg" />
        </motion.div>
      )}
    </div>
  );
}
