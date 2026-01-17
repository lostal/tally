'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Utensils, Receipt } from 'lucide-react';
import { springSmooth } from '@/lib/motion';

// Components
import { SplitMethodSelectorPremium } from '@/components/bill/split-method-selector-premium';
import { AmountInputPremium } from '@/components/bill/amount-input-premium';
import { BillItemList } from '@/components/bill';
import { TipSelectorPremium } from '@/components/payment/tip-selector-premium';
import { PaymentSummaryPremium } from '@/components/payment/payment-summary-premium';
import { PaymentButtonPremium } from '@/components/payment/payment-button-premium';
import { IconButton } from '@/components/shared/motion-primitives';
import { useParticipantStore, useUIStore, useSessionStore } from '@/stores';
import { SubscriptionPlan } from '@/types/subscription';
import { canSplitByItems } from '@/lib/plans';
import { useParticipantSync } from '@/lib/hooks';
import { getMyShare } from '@/lib/utils/split-calculations';
import type { SelectableOrderItem } from '@/types';

interface BillPageClientProps {
  slug: string;
  restaurantName: string;
  tableNumber: string;
  items: SelectableOrderItem[];
  billTotalCents: number;
  plan: SubscriptionPlan;
}

/**
 * BillPageClient - Premium bill management page
 *
 * Complete redesign with:
 * - Elevated visual hierarchy
 * - Smooth micro-animations
 * - Premium component system
 * - Consistent spacing and typography
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
    participantId,
    toggleItem,
    setClaimedQuantity,
    setSplitMethod,
    setFixedAmount,
    setTipPercentage,
  } = useParticipantStore();

  const setCurrentStep = useUIStore((s) => s.setCurrentStep);
  const canSplitItems = canSplitByItems(plan);

  // Session and participant sync (if available)
  const session = useSessionStore((s) => s.session);
  const sessionId = session?.id;

  const { activeParticipants } = useParticipantSync({
    sessionId,
    participantId: participantId || undefined,
    autoFetch: false, // Don't auto-fetch, we already have session from store
    enableHeartbeat: !!sessionId && !!participantId,
  });

  // Calculate items with selection state
  const itemsWithSelection = initialItems.map((item) => ({
    ...item,
    isSelected: selectedItemIds.includes(item.id),
    claimedQuantity: claimedQuantities[item.id] || item.quantity,
  }));

  // Auto-switch between EQUAL and DYNAMIC_EQUAL based on active participants
  React.useEffect(() => {
    if (!sessionId || activeParticipants.length === 0) return;

    const activeCount = activeParticipants.length;

    if (activeCount === 1 && splitMethod === 'DYNAMIC_EQUAL') {
      // Only me → switch to pay all
      setSplitMethod('EQUAL');
    } else if (activeCount > 1 && splitMethod === 'EQUAL') {
      // Someone joined → switch to dynamic split
      setSplitMethod('DYNAMIC_EQUAL');
    }
  }, [activeParticipants.length, splitMethod, setSplitMethod, sessionId]);

  // Calculate totals
  const subtotalCents = React.useMemo(() => {
    if (splitMethod === 'BY_AMOUNT') {
      return fixedAmountCents;
    }
    if (splitMethod === 'EQUAL') {
      return billTotalCents;
    }
    if (splitMethod === 'DYNAMIC_EQUAL') {
      // Calculate my share based on active participants
      if (!participantId || activeParticipants.length === 0) {
        return billTotalCents; // Fallback to full amount
      }
      return getMyShare(billTotalCents, activeParticipants, participantId);
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
    participantId,
    activeParticipants,
  ]);

  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;
  const canProceed = subtotalCents > 0;

  const handleProceed = () => {
    setCurrentStep('payment');
    router.push(`/${slug}/payment?table=${tableNumber}`);
  };

  React.useEffect(() => {
    if (!canSplitItems && splitMethod === 'BY_ITEMS') {
      setSplitMethod('EQUAL');
    }
  }, [canSplitItems, splitMethod, setSplitMethod]);

  React.useEffect(() => {
    setCurrentStep('bill');
  }, [setCurrentStep]);

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* Header - Premium sticky header */}
      <motion.header
        className="border-border/50 bg-background/95 sticky top-0 z-40 shrink-0 border-b backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springSmooth}
      >
        <div className="container-app flex items-center justify-between py-4">
          {/* Back button */}
          <IconButton onClick={() => router.back()} variant="ghost" size="md" className="-ml-2">
            <ChevronLeft className="size-6" />
          </IconButton>

          {/* Restaurant info */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-primary/10 flex size-11 items-center justify-center rounded-xl">
              <Utensils className="text-primary size-5" />
            </div>
            <div className="text-center">
              <h1 className="leading-tight font-semibold">{restaurantName}</h1>
              <p className="text-muted-foreground text-sm">Mesa {tableNumber}</p>
            </div>
          </motion.div>

          {/* Spacer */}
          <div className="w-11" />
        </div>
      </motion.header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        <div className="container-app space-y-8 py-8">
          {/* Empty state */}
          {initialItems.length === 0 ? (
            <motion.section
              className="bg-secondary/30 border-border rounded-2xl border-2 border-dashed p-10 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              >
                <Receipt className="text-muted-foreground/50 mx-auto size-16" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="mt-4 text-xl font-semibold">No hay pedido activo</p>
                <p className="text-muted-foreground mt-2">
                  Aún no se ha creado un pedido para esta mesa
                </p>
              </motion.div>
            </motion.section>
          ) : (
            <>
              {/* Split Method Selector */}
              <SplitMethodSelectorPremium
                value={splitMethod}
                onChange={setSplitMethod}
                disableSplitByItems={!canSplitItems}
              />

              {/* Dynamic content based on split method */}
              <AnimatePresence mode="wait">
                {splitMethod === 'BY_ITEMS' && (
                  <motion.section
                    key="items"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springSmooth}
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
                    key="amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springSmooth}
                  >
                    <AmountInputPremium
                      valueCents={fixedAmountCents}
                      onChange={setFixedAmount}
                      billTotalCents={billTotalCents}
                      remainingCents={billTotalCents}
                    />
                  </motion.section>
                )}

                {splitMethod === 'EQUAL' && (
                  <motion.section
                    key="equal"
                    className="bg-secondary/30 border-border rounded-2xl border-2 p-8 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springSmooth}
                  >
                    <motion.p
                      className="text-primary font-serif text-5xl font-bold"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    >
                      {formatPrice(billTotalCents)}
                    </motion.p>
                    <motion.p
                      className="text-muted-foreground mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Total de la cuenta
                    </motion.p>
                  </motion.section>
                )}

                {splitMethod === 'DYNAMIC_EQUAL' && (
                  <motion.section
                    key="dynamic-equal"
                    className="bg-secondary/30 border-border rounded-2xl border-2 p-8 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springSmooth}
                  >
                    <motion.p
                      className="text-primary font-serif text-5xl font-bold"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    >
                      {formatPrice(subtotalCents)}
                    </motion.p>
                    <motion.p
                      className="text-muted-foreground mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Tu parte{' '}
                      {activeParticipants.length > 1 && `(${activeParticipants.length} personas)`}
                    </motion.p>
                    {activeParticipants.length > 1 && (
                      <motion.p
                        className="text-muted-foreground mt-1 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Total mesa: {formatPrice(billTotalCents)}
                      </motion.p>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Tip Selector */}
              {canProceed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TipSelectorPremium
                    value={tipPercentage}
                    onChange={setTipPercentage}
                    subtotalCents={subtotalCents}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom sticky bar */}
      <AnimatePresence>
        {canProceed && (
          <motion.div
            className="border-border bg-background/95 sticky bottom-0 z-40 shrink-0 border-t backdrop-blur-xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={springSmooth}
          >
            <div className="container-app space-y-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <PaymentSummaryPremium
                subtotalCents={subtotalCents}
                tipCents={tipCents}
                tipPercentage={tipPercentage}
                totalCents={totalCents}
              />
              <PaymentButtonPremium amountCents={totalCents} onClick={handleProceed} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
