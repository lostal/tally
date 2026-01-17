/**
 * useParticipantHeartbeat Hook
 *
 * Sends periodic heartbeats to maintain participant presence.
 * Automatically marks participant as inactive when component unmounts.
 */
'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

interface UseParticipantHeartbeatOptions {
  /** Session ID */
  sessionId: string;
  /** Participant ID */
  participantId: string;
  /** Whether heartbeat is enabled */
  enabled?: boolean;
}

/**
 * Hook to send periodic heartbeats for participant presence
 *
 * @example
 * useParticipantHeartbeat({
 *   sessionId: session.id,
 *   participantId: participant.id,
 *   enabled: true,
 * });
 */
export function useParticipantHeartbeat({
  sessionId,
  participantId,
  enabled = true,
}: UseParticipantHeartbeatOptions): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !sessionId || !participantId) {
      return;
    }

    // Send heartbeat function
    const sendHeartbeat = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ participantId }),
        });

        if (!response.ok) {
          logger.warn(`[Heartbeat] Failed to send heartbeat: ${response.status}`);
        }
      } catch (error) {
        logger.error('[Heartbeat] Error sending heartbeat:', error);
      }
    };

    // Send initial heartbeat immediately
    sendHeartbeat();

    // Set up interval for subsequent heartbeats
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Cleanup function
    return () => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Mark as leaving
      isUnmountingRef.current = true;

      // Send leave notification
      fetch(`/api/session/${sessionId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
        // Use keepalive to ensure request completes even if page unloads
        keepalive: true,
      }).catch((error) => {
        logger.error('[Heartbeat] Error sending leave notification:', error);
      });
    };
  }, [sessionId, participantId, enabled]);
}
