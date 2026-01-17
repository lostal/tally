'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Users, AlertCircle } from 'lucide-react';
import { springSmooth } from '@/lib/motion';
import { formatCents, calculateDynamicSplit } from '@/lib/utils/split-calculations';
import { cn } from '@/lib/utils';
import type { Participant } from '@/types';

interface DynamicSplitIndicatorProps {
  /** Total amount being split in cents */
  totalCents: number;
  /** Active participants in the session */
  activeParticipants: Participant[];
  /** Current participant's ID */
  myParticipantId: string;
  /** My calculated share in cents */
  myShareCents: number;
  /** Optional class name */
  className?: string;
}

/**
 * DynamicSplitIndicator - Shows dynamic split information
 *
 * Features:
 * - Displays number of active participants
 * - Shows my share vs total bill
 * - Indicates if paying extra cents due to rounding
 * - Smooth animations on participant changes
 */
export function DynamicSplitIndicator({
  totalCents,
  activeParticipants,
  myParticipantId,
  myShareCents,
  className,
}: DynamicSplitIndicatorProps) {
  const participantCount = activeParticipants.length;
  const split = calculateDynamicSplit(totalCents, participantCount);

  // Determine if I'm paying extra cents
  const isPayingExtra = split.remainder > 0 && myShareCents > split.baseAmount;

  // Determine if I'm the host
  const sortedParticipants = [...activeParticipants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return (a.joinedAt || '').localeCompare(b.joinedAt || '');
  });
  const isFirstParticipant = sortedParticipants[0]?.id === myParticipantId;

  return (
    <motion.div
      className={cn('bg-primary/5 border-primary/20 space-y-3 rounded-xl border p-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springSmooth}
    >
      {/* Header with participant count */}
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
          <Users className="text-primary size-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Dividiendo entre {participantCount} {participantCount === 1 ? 'persona' : 'personas'}
          </h3>
          <p className="text-muted-foreground text-xs">División automática</p>
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-sm">Tu parte</span>
          <span className="text-lg font-semibold">{formatCents(myShareCents)}</span>
        </div>

        {participantCount > 1 && (
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-xs">Total mesa</span>
            <span className="text-muted-foreground text-sm">{formatCents(totalCents)}</span>
          </div>
        )}
      </div>

      {/* Rounding indicator */}
      {isPayingExtra && (
        <motion.div
          className="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-lg border p-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AlertCircle className="text-primary mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p className="text-xs">
              Pagas {split.remainder === 1 ? '1 céntimo' : `${split.remainder} céntimos`} extra por
              redondeo
              {isFirstParticipant && ' (eres el primero en unirse)'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
