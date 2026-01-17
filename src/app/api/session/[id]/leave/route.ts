import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError, notFound } from '@/lib/api/validation';

/**
 * Schema for leave request
 */
const LeaveSchema = z.object({
  participantId: z.string().uuid(),
});

/**
 * POST /api/session/[id]/leave
 *
 * Marks a participant as inactive when they leave the session.
 * This is called explicitly when a user leaves, complementing the heartbeat timeout mechanism.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;

    const { data, error: validationError } = await validateBody(request, LeaveSchema);
    if (validationError) {
      return validationError;
    }

    const { participantId } = data;
    const supabase = createAdminClient();

    // Verify participant exists and belongs to this session
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, session_id')
      .eq('id', participantId)
      .eq('session_id', sessionId)
      .single();

    if (participantError || !participant) {
      return notFound('Participant not found in this session');
    }

    // Mark participant as inactive
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        is_active: false,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', participantId);

    if (updateError) {
      logApiError('POST /api/session/[id]/leave', updateError);
      return serverError('Failed to mark participant as inactive');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logApiError('POST /api/session/[id]/leave', error);
    return serverError();
  }
}
