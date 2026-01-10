import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Bill, OrderItem } from '@/types';

interface BillState {
  /** Current bill data */
  bill: Bill | null;
  /** Items with selection state */
  items: OrderItem[];
  /** Whether bill is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;

  // Actions
  setBill: (bill: Bill) => void;
  setItems: (items: OrderItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  bill: null,
  items: [],
  isLoading: false,
  error: null,
};

/**
 * Bill Store
 *
 * Manages the current bill/order data.
 */
export const useBillStore = create<BillState>()(
  immer((set) => ({
    ...initialState,

    setBill: (bill) =>
      set((state) => {
        state.bill = bill;
        state.items = bill.items;
        state.isLoading = false;
        state.error = null;
      }),

    setItems: (items) =>
      set((state) => {
        state.items = items;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    reset: () => set(initialState),
  }))
);

// Selectors
export const useBill = () => useBillStore((s) => s.bill);
export const useBillItems = () => useBillStore((s) => s.items);
export const useBillTotal = () => useBillStore((s) => s.bill?.totalCents ?? 0);
export const useIsBillLoading = () => useBillStore((s) => s.isLoading);
