import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError, notFound } from '@/lib/api/validation';
import { calculateDynamicSplit } from '@/lib/utils/split-calculations';

/**
 * Schema for payment initiation request
 */
const InitiatePaymentSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  splitMethod: z.enum(['BY_ITEMS', 'BY_AMOUNT', 'EQUAL', 'DYNAMIC_EQUAL']),
  expectedParticipantCount: z.number().int().positive().optional(),
  billTotalCents: z.number().int().positive().optional(),
});

/**
 * POST /api/payment/initiate
 *
 * Validates payment initiation with server-side checks:
 * - For DYNAMIC_EQUAL: Validates participant count hasn't changed
 * - Ensures mathematical division is correct
 * - Prevents race conditions by comparing expected vs actual state
 *
 * Returns 409 Conflict if validation fails, with details about the mismatch
 */
export async function POST(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, InitiatePaymentSchema);
    if (validationError) {
      return validationError;
    }

    const {
      sessionId,
      participantId,
      amountCents,
      splitMethod,
      expectedParticipantCount,
      billTotalCents,
    } = data;

    const supabase = createAdminClient();

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return notFound('Session not found');
    }

    // Verify participant exists and belongs to this session
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, session_id, is_active')
      .eq('id', participantId)
      .eq('session_id', sessionId)
      .single();

    if (participantError || !participant) {
      return notFound('Participant not found in this session');
    }

    // Check if participant is still active
    if (!participant.is_active) {
      return NextResponse.json(
        {
          error: 'PARTICIPANT_INACTIVE',
          message: 'Participant is no longer active in this session',
        },
        { status: 403 }
      );
    }

    // For DYNAMIC_EQUAL, perform strict validation
    if (splitMethod === 'DYNAMIC_EQUAL') {
      if (!expectedParticipantCount || !billTotalCents) {
        return NextResponse.json(
          {
            error: 'MISSING_REQUIRED_FIELDS',
            message: 'expectedParticipantCount and billTotalCents are required for DYNAMIC_EQUAL',
          },
          { status: 400 }
        );
      }

      // Get current count of active participants
      const { count: actualCount, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('is_active', true);

      if (countError) {
        logApiError('POST /api/payment/initiate - count participants', countError);
        return serverError('Failed to validate participant count');
      }

      // Validate participant count matches
      if (actualCount !== expectedParticipantCount) {
        return NextResponse.json(
          {
            error: 'PARTICIPANT_COUNT_MISMATCH',
            message: 'The number of active participants has changed',
            expectedCount: expectedParticipantCount,
            actualCount: actualCount,
          },
          { status: 409 }
        );
      }

      // Validate mathematical division
      const split = calculateDynamicSplit(billTotalCents, actualCount!);

      // Calculate what this participant should pay
      // We need to check if they're paying the correct amount
      const isValidAmount =
        amountCents === split.baseAmount || // Regular participant
        amountCents === split.baseAmount + split.remainder; // Host (pays extra cents)

      if (!isValidAmount) {
        return NextResponse.json(
          {
            error: 'INVALID_AMOUNT',
            message: 'Payment amount does not match calculated division',
            providedAmount: amountCents,
            expectedBaseAmount: split.baseAmount,
            expectedWithRemainder: split.baseAmount + split.remainder,
          },
          { status: 409 }
        );
      }

      // Verify total bill amount calculation
      const totalShouldBe = split.baseAmount * actualCount! + split.remainder;
      if (totalShouldBe !== billTotalCents) {
        return NextResponse.json(
          {
            error: 'BILL_TOTAL_MISMATCH',
            message: 'Bill total does not match calculated sum',
            providedTotal: billTotalCents,
            calculatedTotal: totalShouldBe,
          },
          { status: 409 }
        );
      }
    }

    // All validations passed
    return NextResponse.json({
      success: true,
      validated: {
        sessionId,
        participantId,
        amountCents,
        splitMethod,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logApiError('POST /api/payment/initiate', error);
    return serverError();
  }
}
