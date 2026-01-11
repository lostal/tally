'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { BillItemList, SplitMethodSelector, AmountInput } from '@/components/bill';
import { TipSelector, PaymentSummary, PaymentButton } from '@/components/payment';
import { Button } from '@/components/ui/button';
import { useParticipantStore, useUIStore } from '@/stores';
// Demo restaurant names
const DEMO_RESTAURANT_NAMES: Record<string, string> = {
  'trattoria-mario': 'Trattoria Mario',
  'sushi-zen': 'Sushi Zen',
  'swiss-bistro': 'Swiss Bistro',
  forkit: 'tally Demo',
};
import type { SelectableOrderItem } from '@/types';
import { ChevronLeft, Utensils } from 'lucide-react';

// Total of all demo items
const BILL_TOTAL_CENTS = 5750;

// Demo bill items
const DEMO_ITEMS: SelectableOrderItem[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    unitPriceCents: 1450,
    quantity: 1,
    isSelected: false,
    claimedQuantity: 1,
    claimedBy: [],
  },
  {
    id: '2',
    name: 'Pasta Carbonara',
    unitPriceCents: 1600,
    quantity: 1,
    isSelected: false,
    claimedQuantity: 1,
    claimedBy: [],
  },
  {
    id: '3',
    name: 'Tiramisú',
    unitPriceCents: 850,
    quantity: 2,
    isSelected: false,
    claimedQuantity: 2,
    claimedBy: [],
  },
  {
    id: '4',
    name: 'Agua con gas',
    unitPriceCents: 400,
    quantity: 2,
    isSelected: false,
    claimedQuantity: 2,
    claimedBy: [],
  },
  {
    id: '5',
    name: 'Café expreso',
    unitPriceCents: 300,
    quantity: 2,
    isSelected: false,
    claimedQuantity: 2,
    claimedBy: [],
  },
];

/**
 * Bill Selection Page
 *
 * User selects items they want to pay for.
 */
export default function BillPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

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

  const restaurantName = DEMO_RESTAURANT_NAMES[slug] || slug;

  // Calculate items with selection state
  const itemsWithSelection = DEMO_ITEMS.map((item) => ({
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
      // Full bill total (in future: BILL_TOTAL_CENTS / participantCount)
      return BILL_TOTAL_CENTS;
    }
    // BY_ITEMS
    return selectedItemIds.reduce((total, itemId) => {
      const item = DEMO_ITEMS.find((i) => i.id === itemId);
      if (!item) return total;
      const qty = claimedQuantities[itemId] || item.quantity;
      return total + item.unitPriceCents * qty;
    }, 0);
  }, [splitMethod, fixedAmountCents, selectedItemIds, claimedQuantities]);

  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;

  const canProceed = subtotalCents > 0;

  const handleProceed = () => {
    setCurrentStep('payment');
    router.push(`/${slug}/payment`);
  };

  React.useEffect(() => {
    setCurrentStep('bill');
  }, [setCurrentStep]);

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* Header - Clean, mobile-first with restaurant branding */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-40 shrink-0 border-b backdrop-blur-sm">
        <div className="container-app relative flex h-16 items-center justify-between">
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
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <Utensils className="text-primary size-5" />
              </div>
              <div className="text-center">
                <h1 className="text-base leading-tight font-semibold">{restaurantName}</h1>
                <p className="text-muted-foreground text-sm">Mesa 7</p>
              </div>
            </div>
          </div>

          {/* Right: Actions/Spacer (if needed) */}
          <div className="z-10 w-10" />
        </div>
      </header>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto">
        <div className="container-app space-y-8 py-6">
          {/* Split Method Selector */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SplitMethodSelector value={splitMethod} onChange={setSplitMethod} />
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
                billTotalCents={5750} // Total of all items
                remainingCents={5750}
              />
            </motion.section>
          )}

          {splitMethod === 'EQUAL' && (
            <motion.section
              className="bg-secondary rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-2xl font-bold">€57.50</p>
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
