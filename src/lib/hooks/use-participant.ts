/**
 * useParticipant Hook
 *
 * Manages the current user's participation state in a session.
 * Handles item selection, split method, and payment readiness.
 */
'use client';

import { useMemo } from 'react';
import { useParticipantStore, calculateUserSubtotal } from '@/stores/participant-store';
import { useBillStore } from '@/stores/bill-store';
import type { PaymentMethod } from '@/types';

type SplitMethod = 'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL' | 'DYNAMIC_EQUAL';

interface UseParticipantReturn {
  /** Current participant ID */
  participantId: string | null;
  /** Selected item IDs */
  selectedItemIds: string[];
  /** Current split method */
  splitMethod: SplitMethod;
  /** Tip percentage */
  tipPercentage: number;
  /** Whether user has confirmed selection */
  isReady: boolean;
  /** Payment method */
  paymentMethod: PaymentMethod | null;
  /** Calculated subtotal in cents */
  subtotalCents: number;
  /** Tip amount in cents */
  tipCents: number;
  /** Total amount to pay in cents */
  totalCents: number;

  // Actions
  /** Set participant ID */
  setParticipantId: (id: string) => void;
  /** Toggle item selection */
  toggleItem: (itemId: string, quantity?: number) => void;
  /** Set claimed quantity for an item */
  setClaimedQuantity: (itemId: string, quantity: number) => void;
  /** Change split method */
  setSplitMethod: (method: SplitMethod) => void;
  /** Set fixed amount (for BY_AMOUNT method) */
  setFixedAmount: (cents: number) => void;
  /** Set tip percentage */
  setTipPercentage: (percent: number) => void;
  /** Set payment method */
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Mark as ready to pay */
  markReady: () => void;
  /** Cancel ready state */
  cancelReady: () => void;
  /** Reset all selections */
  reset: () => void;
}

/**
 * Hook to manage current user's participation in bill splitting
 *
 * @example
 * const {
 *   selectedItemIds,
 *   toggleItem,
 *   totalCents,
 *   markReady,
 * } = useParticipant();
 */
export function useParticipant(): UseParticipantReturn {
  const {
    participantId,
    selectedItemIds,
    claimedQuantities,
    splitMethod,
    fixedAmountCents,
    tipPercentage,
    isReady,
    paymentMethod,
    setParticipantId,
    toggleItem,
    setClaimedQuantity,
    setSplitMethod,
    setFixedAmount,
    setTipPercentage,
    setPaymentMethod,
    markReady,
    cancelReady,
    reset,
  } = useParticipantStore();

  const { items: billItems, bill } = useBillStore();

  // Calculate subtotal based on selection method
  const subtotalCents = useMemo(() => {
    switch (splitMethod) {
      case 'BY_ITEMS':
        return calculateUserSubtotal(
          billItems.map((item) => ({
            ...item,
            isSelected: selectedItemIds.includes(item.id),
            claimedQuantity: claimedQuantities[item.id] || item.quantity,
            claimedBy: [],
          })),
          selectedItemIds,
          claimedQuantities
        );

      case 'BY_AMOUNT':
        return fixedAmountCents;

      case 'EQUAL':
        // Will be calculated based on number of participants
        // For now return total / assumed 2 participants
        return bill ? Math.floor(bill.totalCents / 2) : 0;

      default:
        return 0;
    }
  }, [splitMethod, selectedItemIds, claimedQuantities, billItems, fixedAmountCents, bill]);

  // Calculate tip
  const tipCents = useMemo(() => {
    return Math.round(subtotalCents * (tipPercentage / 100));
  }, [subtotalCents, tipPercentage]);

  // Calculate total
  const totalCents = useMemo(() => {
    return subtotalCents + tipCents;
  }, [subtotalCents, tipCents]);

  return {
    participantId,
    selectedItemIds,
    splitMethod,
    tipPercentage,
    isReady,
    paymentMethod,
    subtotalCents,
    tipCents,
    totalCents,

    setParticipantId,
    toggleItem,
    setClaimedQuantity,
    setSplitMethod,
    setFixedAmount,
    setTipPercentage,
    setPaymentMethod,
    markReady,
    cancelReady,
    reset,
  };
}

// Re-export commonly used selectors
export {
  useSelectedItems,
  useSplitMethod,
  useTipPercentage,
  useIsReady,
} from '@/stores/participant-store';
