'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ParticipantAvatar } from './participant-avatar';

interface Participant {
  id: string;
  name?: string;
  imageUrl?: string;
  isReady: boolean;
  color?: string;
}

interface ParticipantListProps {
  /** List of participants */
  participants: Participant[];
  /** Current user's participant ID */
  currentUserId?: string;
  /** Maximum to display before showing "+X more" */
  maxDisplay?: number;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

/**
 * ParticipantList - Shows all participants in the session
 *
 * Displays avatars with ready states, supports overflow.
 */
export function ParticipantList({
  participants,
  currentUserId,
  maxDisplay = 6,
  layout = 'horizontal',
  className,
}: ParticipantListProps) {
  const displayParticipants = participants.slice(0, maxDisplay);
  const overflowCount = participants.length - maxDisplay;
  const readyCount = participants.filter((p) => p.isReady).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Participants
        </h2>
        <span className="text-muted-foreground text-sm">
          {readyCount}/{participants.length} ready
        </span>
      </div>

      {/* Avatar list */}
      <div
        className={cn('flex', layout === 'horizontal' ? 'flex-row -space-x-2' : 'flex-col gap-3')}
      >
        {displayParticipants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={layout === 'horizontal' ? 'relative' : ''}
            style={layout === 'horizontal' ? { zIndex: participants.length - index } : undefined}
          >
            {layout === 'vertical' ? (
              <div className="flex items-center gap-3">
                <ParticipantAvatar
                  name={participant.name}
                  imageUrl={participant.imageUrl}
                  isReady={participant.isReady}
                  color={participant.color}
                  isCurrentUser={participant.id === currentUserId}
                  size="md"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {participant.name || 'Guest'}
                    {participant.id === currentUserId && (
                      <span className="text-muted-foreground ml-2 text-xs">(you)</span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {participant.isReady ? 'Ready' : 'Selecting items...'}
                  </div>
                </div>
              </div>
            ) : (
              <ParticipantAvatar
                name={participant.name}
                imageUrl={participant.imageUrl}
                isReady={participant.isReady}
                color={participant.color}
                isCurrentUser={participant.id === currentUserId}
                size="md"
              />
            )}
          </motion.div>
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && layout === 'horizontal' && (
          <motion.div
            className="bg-muted relative flex size-12 items-center justify-center rounded-full text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: displayParticipants.length * 0.1 }}
          >
            +{overflowCount}
          </motion.div>
        )}
      </div>
    </div>
  );
}
