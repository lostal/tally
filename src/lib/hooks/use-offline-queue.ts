'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  useOfflineQueueStore,
  usePendingOperations,
  useIsProcessingQueue,
} from '@/stores/offline-queue-store';
import { logger } from '@/lib/logger';
import type { ConnectionStatus } from './use-realtime';

/**
 * Hook to manage offline queue processing
 *
 * Automatically retries pending operations when connection is restored.
 */
export function useOfflineQueue(connectionStatus: ConnectionStatus) {
  const operations = usePendingOperations();
  const isProcessing = useIsProcessingQueue();
  const { removeOperation, incrementRetry, setProcessing, setLastSync } = useOfflineQueueStore();

  const processingRef = useRef(false);

  // Process queue when connected
  const processQueue = useCallback(async () => {
    if (processingRef.current || operations.length === 0) return;

    processingRef.current = true;
    setProcessing(true);

    for (const op of operations) {
      if (op.retryCount >= op.maxRetries) {
        logger.warn('OfflineQueue max retries reached, removing', { operationId: op.id });
        removeOperation(op.id);
        continue;
      }

      try {
        const response = await fetch(op.endpoint, {
          method: op.type === 'DELETE' ? 'DELETE' : op.type === 'CREATE' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.payload),
        });

        if (response.ok) {
          logger.debug('OfflineQueue synced successfully', { operationId: op.id });
          removeOperation(op.id);
        } else {
          logger.warn('OfflineQueue sync failed, will retry', { operationId: op.id });
          incrementRetry(op.id);
        }
      } catch (error) {
        logger.error('OfflineQueue network error', { operationId: op.id, error });
        incrementRetry(op.id);
      }
    }

    setLastSync(Date.now());
    setProcessing(false);
    processingRef.current = false;
  }, [operations, removeOperation, incrementRetry, setProcessing, setLastSync]);

  // Auto-process when connection is restored
  useEffect(() => {
    if (connectionStatus === 'connected' && operations.length > 0 && !isProcessing) {
      // Small delay to ensure connection is stable
      const timeout = setTimeout(processQueue, 1000);
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus, operations.length, isProcessing, processQueue]);

  return {
    pendingCount: operations.length,
    isProcessing,
    processQueue,
  };
}

/**
 * Wrapper to queue an operation for offline support
 */
export function useQueueOperation() {
  const { addOperation } = useOfflineQueueStore();

  return useCallback(
    async (
      endpoint: string,
      method: 'POST' | 'PATCH' | 'DELETE',
      payload: Record<string, unknown>
    ): Promise<Response | null> => {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return response;
      } catch {
        // Network error - queue for later
        const opType = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        addOperation(opType, endpoint, payload);
        logger.debug('OfflineQueue operation queued', { type: opType, endpoint });
        return null;
      }
    },
    [addOperation]
  );
}
