import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SelectableOrderItem, PaymentMethod } from '@/types';

type SplitMethod = 'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL';

interface ParticipantState {
  /** Current participant ID */
  participantId: string | null;
  /** Selected item IDs */
  selectedItemIds: string[];
  /** Claimed quantities per item (for partial claims) */
  claimedQuantities: Record<string, number>;
  /** Split method chosen */
  splitMethod: SplitMethod;
  /** Fixed amount in cents (for BY_AMOUNT) */
  fixedAmountCents: number;
  /** Tip percentage */
  tipPercentage: number;
  /** Whether participant has confirmed selection */
  isReady: boolean;
  /** Payment method selected */
  paymentMethod: PaymentMethod | null;

  // Actions
  setParticipantId: (id: string) => void;
  toggleItem: (itemId: string, quantity?: number) => void;
  setClaimedQuantity: (itemId: string, quantity: number) => void;
  setSplitMethod: (method: SplitMethod) => void;
  setFixedAmount: (cents: number) => void;
  setTipPercentage: (percent: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  markReady: () => void;
  cancelReady: () => void;
  reset: () => void;
}

const initialState = {
  participantId: null,
  selectedItemIds: [],
  claimedQuantities: {},
  splitMethod: 'BY_ITEMS' as SplitMethod,
  fixedAmountCents: 0,
  tipPercentage: 0,
  isReady: false,
  paymentMethod: null,
};

/**
 * Participant Store
 *
 * Manages the current user's selection state within a session.
 */
export const useParticipantStore = create<ParticipantState>()(
  immer((set) => ({
    ...initialState,

    setParticipantId: (id) =>
      set((state) => {
        state.participantId = id;
      }),

    toggleItem: (itemId, quantity = 1) =>
      set((state) => {
        const index = state.selectedItemIds.indexOf(itemId);
        if (index === -1) {
          state.selectedItemIds.push(itemId);
          state.claimedQuantities[itemId] = quantity;
        } else {
          state.selectedItemIds.splice(index, 1);
          delete state.claimedQuantities[itemId];
        }
      }),

    setClaimedQuantity: (itemId, quantity) =>
      set((state) => {
        if (state.selectedItemIds.includes(itemId)) {
          state.claimedQuantities[itemId] = quantity;
        }
      }),

    setSplitMethod: (method) =>
      set((state) => {
        state.splitMethod = method;
        // Reset item selection when switching methods
        if (method !== 'BY_ITEMS') {
          state.selectedItemIds = [];
          state.claimedQuantities = {};
        }
      }),

    setFixedAmount: (cents) =>
      set((state) => {
        state.fixedAmountCents = cents;
      }),

    setTipPercentage: (percent) =>
      set((state) => {
        state.tipPercentage = percent;
      }),

    setPaymentMethod: (method) =>
      set((state) => {
        state.paymentMethod = method;
      }),

    markReady: () =>
      set((state) => {
        state.isReady = true;
      }),

    cancelReady: () =>
      set((state) => {
        state.isReady = false;
      }),

    reset: () => set(initialState),
  }))
);

// Selectors
export const useSelectedItems = () => useParticipantStore((s) => s.selectedItemIds);
export const useSplitMethod = () => useParticipantStore((s) => s.splitMethod);
export const useTipPercentage = () => useParticipantStore((s) => s.tipPercentage);
export const useIsReady = () => useParticipantStore((s) => s.isReady);

/**
 * Calculate the user's subtotal based on their selection
 */
export function calculateUserSubtotal(
  items: SelectableOrderItem[],
  selectedIds: string[],
  claimedQuantities: Record<string, number>
): number {
  return selectedIds.reduce((total, itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return total;
    const quantity = claimedQuantities[itemId] || item.quantity;
    return total + item.unitPriceCents * quantity;
  }, 0);
}
