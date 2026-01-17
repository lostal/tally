/**
 * useParticipantSync Hook
 *
 * Combines session management with participant heartbeat.
 * Automatically maintains participant presence while using the session.
 */
'use client';

import { useSession } from './use-session';
import { useParticipantHeartbeat } from './use-participant-heartbeat';
import type { Session, Participant } from '@/types';
import type { ConnectionStatus } from './use-realtime';

interface UseParticipantSyncOptions {
  /** Session ID to load and subscribe to */
  sessionId?: string;
  /** Participant ID for heartbeat */
  participantId?: string;
  /** Whether to auto-fetch session on mount */
  autoFetch?: boolean;
  /** Whether heartbeat is enabled */
  enableHeartbeat?: boolean;
}

interface UseParticipantSyncReturn {
  /** Current session */
  session: Session | null;
  /** Participants in the session */
  participants: Participant[];
  /** Active participants (is_active = true) */
  activeParticipants: Participant[];
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
 * Hook to manage session with automatic participant heartbeat
 *
 * Combines useSession with useParticipantHeartbeat to automatically
 * maintain participant presence in the session.
 *
 * @example
 * const { session, activeParticipants } = useParticipantSync({
 *   sessionId: params.sessionId,
 *   participantId: participant.id,
 *   autoFetch: true,
 *   enableHeartbeat: true,
 * });
 */
export function useParticipantSync({
  sessionId,
  participantId,
  autoFetch = true,
  enableHeartbeat = true,
}: UseParticipantSyncOptions = {}): UseParticipantSyncReturn {
  // Use session hook for session management and realtime
  const sessionData = useSession({
    sessionId,
    autoFetch,
  });

  // Set up heartbeat for this participant
  useParticipantHeartbeat({
    sessionId: sessionId || '',
    participantId: participantId || '',
    enabled: enableHeartbeat && !!sessionId && !!participantId,
  });

  // Filter active participants
  const activeParticipants = sessionData.participants.filter((p) => p.isActive);

  return {
    ...sessionData,
    activeParticipants,
  };
}
