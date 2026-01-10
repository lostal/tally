'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check } from 'lucide-react';

interface ParticipantAvatarProps {
  /** Participant name (for initials) */
  name?: string;
  /** Avatar image URL */
  imageUrl?: string;
  /** Whether participant is ready */
  isReady?: boolean;
  /** Participant's assigned color */
  color?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether this is the current user */
  isCurrentUser?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const SIZE_MAP = {
  sm: { avatar: 'size-8', check: 'size-3', indicator: 'size-4 -bottom-0.5 -right-0.5' },
  md: { avatar: 'size-12', check: 'size-4', indicator: 'size-5 -bottom-1 -right-1' },
  lg: { avatar: 'size-16', check: 'size-5', indicator: 'size-6 -bottom-1 -right-1' },
};

// Predefined colors for participants
const PARTICIPANT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
];

/**
 * ParticipantAvatar - Avatar with ready state indicator
 *
 * Shows participant's avatar or initials with a checkmark when ready.
 */
export function ParticipantAvatar({
  name,
  imageUrl,
  isReady = false,
  color,
  size = 'md',
  isCurrentUser = false,
  className,
}: ParticipantAvatarProps) {
  const sizes = SIZE_MAP[size];

  // Get initials from name
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Default color if none provided
  const bgColor =
    color || PARTICIPANT_COLORS[Math.abs(name?.charCodeAt(0) || 0) % PARTICIPANT_COLORS.length];

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Avatar className={cn(sizes.avatar, isCurrentUser && 'ring-primary ring-2 ring-offset-2')}>
        {imageUrl && <AvatarImage src={imageUrl} alt={name || 'Participant'} />}
        <AvatarFallback className={cn(bgColor, 'font-semibold text-white')}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Ready indicator */}
      <motion.div
        className={cn(
          'absolute flex items-center justify-center rounded-full',
          sizes.indicator,
          isReady ? 'bg-success' : 'bg-muted border-background border-2'
        )}
        animate={isReady ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isReady && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className={cn(sizes.check, 'text-white')} strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Export colors for use elsewhere
export { PARTICIPANT_COLORS };
