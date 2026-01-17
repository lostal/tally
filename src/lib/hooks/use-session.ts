/**
 * useSession Hook
 *
 * High-level hook for managing session state and real-time updates.
 * Combines session store with realtime subscriptions.
 */
'use client';

import { useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/stores/session-store';
import { useRealtime, type ConnectionStatus } from './use-realtime';
import type { Session, Participant } from '@/types';

interface UseSessionOptions {
  /** Session ID to load and subscribe to */
  sessionId?: string;
  /** Whether to auto-fetch session on mount */
  autoFetch?: boolean;
}

interface UseSessionReturn {
  /** Current session */
  session: Session | null;
  /** Participants in the session */
  participants: Participant[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Realtime connection status */
  connectionStatus: ConnectionStatus;
  /** Fetch session data */
  fetchSession: () => Promise<void>;
  /** Join the session as a participant */
  joinSession: (name?: string) => Promise<Participant | null>;
  /** Leave the session */
  leaveSession: () => Promise<void>;
  /** Mark current participant as ready */
  markReady: () => Promise<void>;
}

/**
 * Hook to manage a session with real-time updates
 *
 * @example
 * const { session, participants, connectionStatus } = useSession({
 *   sessionId: params.sessionId,
 *   autoFetch: true,
 * });
 */
export function useSession({
  sessionId,
  autoFetch = true,
}: UseSessionOptions = {}): UseSessionReturn {
  const {
    session,
    isLoading,
    error,
    setSession,
    setLoading,
    setError,
    addParticipant,
    removeParticipant,
    updateParticipant,
    reset,
  } = useSessionStore();

  // Fetch session data from API
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [sessionId, setLoading, setSession, setError]);

  // Subscribe to participant changes
  const { status: connectionStatus } = useRealtime<Participant>({
    table: 'participants',
    filterColumn: 'session_id',
    filterValue: sessionId,
    enabled: !!sessionId,
    onInsert: (participant) => {
      addParticipant(participant);
    },
    onUpdate: (participant) => {
      updateParticipant(participant.id, participant);
    },
    onDelete: ({ old }) => {
      removeParticipant(old.id);
    },
  });

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && sessionId) {
      fetchSession();
    }

    return () => {
      reset();
    };
  }, [sessionId, autoFetch, fetchSession, reset]);

  // Join session as new participant
  const joinSession = useCallback(
    async (name?: string): Promise<Participant | null> => {
      if (!sessionId) return null;

      try {
        const response = await fetch(`/api/session/${sessionId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          throw new Error('Failed to join session');
        }

        const participant = await response.json();
        return participant;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join');
        return null;
      }
    },
    [sessionId, setError]
  );

  // Leave session
  const leaveSession = useCallback(async (): Promise<void> => {
    if (!sessionId) return;

    try {
      await fetch(`/api/session/${sessionId}/leave`, {
        method: 'POST',
      });
      reset();
    } catch (err) {
      logger.error('Failed to leave session:', err);
    }
  }, [sessionId, reset]);

  // Mark as ready
  const markReady = useCallback(async (): Promise<void> => {
    if (!sessionId) return;

    try {
      await fetch(`/api/session/${sessionId}/ready`, {
        method: 'POST',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark ready');
    }
  }, [sessionId, setError]);

  return {
    session,
    participants: session?.participants ?? [],
    isLoading,
    error,
    connectionStatus,
    fetchSession,
    joinSession,
    leaveSession,
    markReady,
  };
}

// Re-export selectors from store for convenience
export {
  useSession as useSessionHook,
  useParticipants,
  useSessionStatus,
  useIsSessionLoading,
} from '@/stores/session-store';
