/**
 * Split Calculation Utilities
 *
 * Handles dynamic split calculations with proper cent distribution.
 */

import type { Participant } from '@/types';

/**
 * Result of a dynamic split calculation
 */
export interface DynamicSplitResult {
  /** Base amount in cents that each participant pays */
  baseAmount: number;
  /** Remaining cents after division (0 to participantCount-1) */
  remainder: number;
  /** Total amount being split */
  totalCents: number;
  /** Number of active participants */
  participantCount: number;
}

/**
 * Calculate how to split an amount among participants
 *
 * Uses integer division to avoid floating point errors.
 * The remainder cents are distributed to ensure the total matches exactly.
 *
 * @param totalCents - Total amount to split in cents
 * @param participantCount - Number of active participants
 * @returns Split calculation result
 *
 * @example
 * calculateDynamicSplit(1000, 3)
 * // Returns: { baseAmount: 333, remainder: 1, totalCents: 1000, participantCount: 3 }
 * // Host pays 334, others pay 333 each
 */
export function calculateDynamicSplit(
  totalCents: number,
  participantCount: number
): DynamicSplitResult {
  if (participantCount <= 0) {
    return {
      baseAmount: 0,
      remainder: 0,
      totalCents,
      participantCount: 0,
    };
  }

  if (participantCount === 1) {
    return {
      baseAmount: totalCents,
      remainder: 0,
      totalCents,
      participantCount: 1,
    };
  }

  const baseAmount = Math.floor(totalCents / participantCount);
  const remainder = totalCents % participantCount;

  return {
    baseAmount,
    remainder,
    totalCents,
    participantCount,
  };
}

/**
 * Get the share amount for a specific participant
 *
 * The host (or first participant by ID sort) pays extra cents from rounding.
 * This ensures a deterministic and fair distribution.
 *
 * @param totalCents - Total amount to split
 * @param participants - All active participants
 * @param myParticipantId - Current participant's ID
 * @returns Amount this participant should pay in cents
 *
 * @example
 * getMyShare(1000, [participant1, participant2, participant3], participant1.id)
 * // Returns: 334 (host pays the extra cent)
 *
 * getMyShare(1000, [participant1, participant2, participant3], participant2.id)
 * // Returns: 333
 */
export function getMyShare(
  totalCents: number,
  participants: Participant[],
  myParticipantId: string
): number {
  const activeParticipants = participants.filter((p) => p.isActive);
  const split = calculateDynamicSplit(totalCents, activeParticipants.length);

  if (split.participantCount === 0) {
    return 0;
  }

  if (split.participantCount === 1) {
    return totalCents;
  }

  // Determine if this participant is the host (pays extra cents)
  const sortedParticipants = [...activeParticipants].sort((a, b) => {
    // Hosts always go first
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    // Otherwise sort by join time (earliest first)
    return (a.joinedAt || '').localeCompare(b.joinedAt || '');
  });

  const isFirstParticipant = sortedParticipants[0]?.id === myParticipantId;

  if (isFirstParticipant && split.remainder > 0) {
    return split.baseAmount + split.remainder;
  }

  return split.baseAmount;
}

/**
 * Validate that split amounts sum to total
 *
 * @param totalCents - Expected total
 * @param participantAmounts - Array of individual amounts
 * @returns True if sum matches total
 */
export function validateSplitSum(totalCents: number, participantAmounts: number[]): boolean {
  const sum = participantAmounts.reduce((acc, amount) => acc + amount, 0);
  return sum === totalCents;
}

/**
 * Format cents to currency string
 *
 * @param cents - Amount in cents
 * @param currency - Currency code (default: EUR)
 * @returns Formatted string like "€3.34"
 */
export function formatCents(cents: number, currency: string = 'EUR'): string {
  const euros = cents / 100;
  const symbol = currency === 'EUR' ? '€' : currency;
  return `${symbol}${euros.toFixed(2)}`;
}
