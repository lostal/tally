import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError, notFound } from '@/lib/api/validation';

/**
 * Schema for heartbeat request
 */
const HeartbeatSchema = z.object({
  participantId: z.string().uuid(),
});

/**
 * POST /api/session/[id]/heartbeat
 *
 * Updates last_seen_at for a participant to indicate they're still active.
 * Used by client-side heartbeat to maintain participant presence.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;

    const { data, error: validationError } = await validateBody(request, HeartbeatSchema);
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

    // Update last_seen_at to NOW() and ensure is_active is true
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        last_seen_at: new Date().toISOString(),
        is_active: true,
      })
      .eq('id', participantId);

    if (updateError) {
      logApiError('POST /api/session/[id]/heartbeat', updateError);
      return serverError('Failed to update heartbeat');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logApiError('POST /api/session/[id]/heartbeat', error);
    return serverError();
  }
}
