'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { BillItemList, SplitMethodSelector, AmountInput } from '@/components/bill';
import { TipSelector, PaymentSummary, PaymentButton } from '@/components/payment';
import { Button } from '@/components/ui/button';
import { useParticipantStore, useUIStore } from '@/stores';
import { SubscriptionPlan } from '@/types/subscription';
import { canSplitByItems } from '@/lib/plans';
import type { SelectableOrderItem } from '@/types';
import { ChevronLeft, Utensils } from 'lucide-react';

interface BillPageClientProps {
  slug: string;
  restaurantName: string;
  tableNumber: string;
  items: SelectableOrderItem[];
  billTotalCents: number;
  plan: SubscriptionPlan;
}

/**
 * Bill Page Client Component
 *
 * Handles item selection, split method, and tip calculation.
 */
export function BillPageClient({
  slug,
  restaurantName,
  tableNumber,
  items: initialItems,
  billTotalCents,
  plan,
}: BillPageClientProps) {
  const router = useRouter();

  const {
    selectedItemIds,
    claimedQuantities,
    splitMethod,
    fixedAmountCents,
    tipPercentage,
    toggleItem,
    setClaimedQuantity,
    setSplitMethod,
    setFixedAmount,
    setTipPercentage,
  } = useParticipantStore();

  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const canSplitItems = canSplitByItems(plan);

  // ... (rest of store logic)

  // Calculate items with selection state
  const itemsWithSelection = initialItems.map((item) => ({
    ...item,
    isSelected: selectedItemIds.includes(item.id),
    claimedQuantity: claimedQuantities[item.id] || item.quantity,
  }));

  // Calculate totals
  const subtotalCents = React.useMemo(() => {
    if (splitMethod === 'BY_AMOUNT') {
      return fixedAmountCents;
    }
    if (splitMethod === 'EQUAL') {
      // Full bill total (in future: billTotalCents / participantCount)
      return billTotalCents;
    }
    // BY_ITEMS
    return selectedItemIds.reduce((total, itemId) => {
      const item = initialItems.find((i) => i.id === itemId);
      if (!item) return total;
      const qty = claimedQuantities[itemId] || item.quantity;
      return total + item.unitPriceCents * qty;
    }, 0);
  }, [
    splitMethod,
    fixedAmountCents,
    billTotalCents,
    selectedItemIds,
    claimedQuantities,
    initialItems,
  ]);

  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;

  const canProceed = subtotalCents > 0;

  const handleProceed = () => {
    setCurrentStep('payment');
    router.push(`/${slug}/payment?table=${tableNumber}`);
  };

  React.useEffect(() => {
    // If not allowed to split by items but store has that selected, reset to EQUAL
    if (!canSplitItems && splitMethod === 'BY_ITEMS') {
      setSplitMethod('EQUAL');
    }
  }, [canSplitItems, splitMethod, setSplitMethod]); // Add dependencies

  React.useEffect(() => {
    setCurrentStep('bill');
  }, [setCurrentStep]);

  // Format cents to euros
  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* Header - Clean, mobile-first with restaurant branding */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-40 shrink-0 border-b backdrop-blur-sm">
        <div className="container-app relative flex h-auto items-center justify-between py-5">
          {/* Left: Back button - z-index higher than center */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="z-10 -ml-2 shrink-0"
          >
            <ChevronLeft className="size-6" />
          </Button>

          {/* Center: Restaurant name + table - Absolutely centered */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-3">
              <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
                <Utensils className="text-primary size-6" />
              </div>
              <div className="text-center">
                <h1 className="text-lg leading-tight font-semibold">{restaurantName}</h1>
                <p className="text-muted-foreground text-sm">Mesa {tableNumber}</p>
              </div>
            </div>
          </div>

          {/* Right: Actions/Spacer (if needed) */}
          <div className="z-10 w-10" />
        </div>
      </header>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto">
        <div className="container-app space-y-8 py-8">
          {/* Empty state if no items */}
          {initialItems.length === 0 ? (
            <motion.section
              className="bg-secondary rounded-2xl border-2 p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Utensils className="text-muted-foreground mx-auto mb-4 size-12" />
              <p className="text-lg font-semibold">No hay pedido activo</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Aún no se ha creado un pedido para esta mesa
              </p>
            </motion.section>
          ) : (
            <>
              {/* Split Method Selector */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <SplitMethodSelector
                  value={splitMethod}
                  onChange={setSplitMethod}
                  disableSplitByItems={!canSplitItems}
                />
              </motion.section>

              {/* Content based on split method */}
              {splitMethod === 'BY_ITEMS' && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BillItemList
                    items={itemsWithSelection}
                    onItemToggle={toggleItem}
                    onItemQuantityChange={setClaimedQuantity}
                  />
                </motion.section>
              )}

              {splitMethod === 'BY_AMOUNT' && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <AmountInput
                    valueCents={fixedAmountCents}
                    onChange={setFixedAmount}
                    billTotalCents={billTotalCents}
                    remainingCents={billTotalCents}
                  />
                </motion.section>
              )}

              {splitMethod === 'EQUAL' && (
                <motion.section
                  className="bg-secondary rounded-2xl border-2 p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-2xl font-bold">{formatPrice(billTotalCents)}</p>
                  <p className="text-muted-foreground mt-1 text-sm">Total de la cuenta</p>
                </motion.section>
              )}

              {/* Tip Selector - always visible when canProceed */}
              {canProceed && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pb-4"
                >
                  <TipSelector
                    value={tipPercentage}
                    onChange={setTipPercentage}
                    subtotalCents={subtotalCents}
                  />
                </motion.section>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom bar - sticky at bottom, reserves space */}
      {canProceed && (
        <motion.div
          className="border-border bg-background sticky bottom-0 z-40 shrink-0 border-t p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="container-app space-y-4">
            <PaymentSummary
              subtotalCents={subtotalCents}
              tipCents={tipCents}
              tipPercentage={tipPercentage}
              totalCents={totalCents}
            />
            <PaymentButton amountCents={totalCents} onClick={handleProceed} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
