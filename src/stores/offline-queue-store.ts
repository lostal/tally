import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

/**
 * Offline Operation Queue Store
 *
 * Stores pending operations when the app is offline.
 * Operations are retried automatically when connection is restored.
 */

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface PendingOperation {
  id: string;
  type: OperationType;
  endpoint: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineQueueState {
  /** Pending operations */
  operations: PendingOperation[];
  /** Whether currently processing queue */
  isProcessing: boolean;
  /** Last sync timestamp */
  lastSyncAt: number | null;

  // Actions
  addOperation: (type: OperationType, endpoint: string, payload: Record<string, unknown>) => string;
  removeOperation: (id: string) => void;
  incrementRetry: (id: string) => void;
  clearQueue: () => void;
  setProcessing: (processing: boolean) => void;
  setLastSync: (timestamp: number) => void;
}

const generateId = () => `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    immer((set) => ({
      operations: [],
      isProcessing: false,
      lastSyncAt: null,

      addOperation: (type, endpoint, payload) => {
        const id = generateId();
        set((state) => {
          state.operations.push({
            id,
            type,
            endpoint,
            payload,
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3,
          });
        });
        return id;
      },

      removeOperation: (id) =>
        set((state) => {
          state.operations = state.operations.filter((op) => op.id !== id);
        }),

      incrementRetry: (id) =>
        set((state) => {
          const op = state.operations.find((o) => o.id === id);
          if (op) {
            op.retryCount += 1;
          }
        }),

      clearQueue: () =>
        set((state) => {
          state.operations = [];
        }),

      setProcessing: (processing) =>
        set((state) => {
          state.isProcessing = processing;
        }),

      setLastSync: (timestamp) =>
        set((state) => {
          state.lastSyncAt = timestamp;
        }),
    })),
    {
      name: 'tally-offline-queue',
      partialize: (state) => ({
        operations: state.operations,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// Selectors
export const usePendingOperations = () => useOfflineQueueStore((s) => s.operations);
export const useIsProcessingQueue = () => useOfflineQueueStore((s) => s.isProcessing);
export const usePendingCount = () => useOfflineQueueStore((s) => s.operations.length);
