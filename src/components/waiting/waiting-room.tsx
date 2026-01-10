'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParticipantList } from './participant-list';
import { ReadyIndicator } from './ready-indicator';
import { CountdownTimer } from './countdown-timer';
import { Clock } from 'lucide-react';

interface Participant {
  id: string;
  name?: string;
  imageUrl?: string;
  isReady: boolean;
  color?: string;
}

interface WaitingRoomProps {
  /** List of participants */
  participants: Participant[];
  /** Current user's ID */
  currentUserId: string;
  /** Whether current user is ready */
  isCurrentUserReady: boolean;
  /** Callback when user marks ready */
  onMarkReady: () => void;
  /** Callback when user cancels ready */
  onCancelReady: () => void;
  /** Callback when countdown completes */
  onCountdownComplete: () => void;
  /** Countdown duration in seconds */
  countdownSeconds?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WaitingRoom - Full waiting room view for multi-user sync
 *
 * Shows all participants and their ready states.
 * Triggers countdown when everyone is ready.
 */
export function WaitingRoom({
  participants,
  currentUserId,
  isCurrentUserReady,
  onMarkReady,
  onCancelReady,
  onCountdownComplete,
  countdownSeconds = 3,
  className,
}: WaitingRoomProps) {
  const readyCount = participants.filter((p) => p.isReady).length;
  const totalCount = participants.length;
  const allReady = readyCount === totalCount && totalCount > 0;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-muted-foreground mb-2 flex items-center justify-center gap-2">
          <Clock className="size-4" />
          <span className="text-sm">Esperando a todos</span>
        </div>
        <h1 className="text-2xl font-bold">¿Listos para pagar?</h1>
        <p className="text-muted-foreground mt-2">Confirma tu selección cuando hayas terminado</p>
      </motion.div>

      {/* Countdown or Ready indicator */}
      {allReady ? (
        <CountdownTimer
          seconds={countdownSeconds}
          isActive={allReady}
          onComplete={onCountdownComplete}
        />
      ) : (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ReadyIndicator readyCount={readyCount} totalCount={totalCount} />
        </motion.div>
      )}

      {/* Participant list */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <ParticipantList
            participants={participants}
            currentUserId={currentUserId}
            layout="vertical"
          />
        </CardContent>
      </Card>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isCurrentUserReady ? (
          <Button
            variant="outline"
            onClick={onCancelReady}
            className="w-full rounded-2xl"
            size="lg"
          >
            Cambiar mi selección
          </Button>
        ) : (
          <Button onClick={onMarkReady} className="w-full rounded-2xl" size="lg">
            Estoy listo
          </Button>
        )}
      </motion.div>

      {/* Info text */}
      <p className="text-muted-foreground text-center text-xs">
        El pago empezará automáticamente cuando todos estén listos
      </p>
    </div>
  );
}
