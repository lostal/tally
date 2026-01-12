import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError } from '@/lib/api/validation';

/**
 * Session creation schema
 */
const CreateSessionSchema = z.object({
  slug: z.string().min(1, 'Restaurant slug is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
  participantName: z.string().min(1).max(50).optional(),
});

/**
 * POST /api/session/create
 *
 * Creates or joins a payment session for a table.
 * - Finds restaurant by slug
 * - Finds table by number
 * - Creates or returns existing active session
 * - Creates participant for the user
 */
export async function POST(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, CreateSessionSchema);
    if (validationError) {
      return validationError;
    }

    const { slug, tableNumber, participantName } = data;
    const supabase = createAdminClient();

    // 1. Find restaurant by slug
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found', code: 'RESTAURANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 2. Find table by number
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurant.id)
      .eq('number', tableNumber)
      .eq('is_active', true)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        { error: 'Table not found', code: 'TABLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 3. Check for existing active session for this table
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id, created_at')
      .eq('table_id', table.id)
      .eq('status', 'active')
      .single();

    let sessionId: string;
    let isNewSession = false;

    if (existingSession) {
      // Join existing session
      sessionId = existingSession.id;
    } else {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          restaurant_id: restaurant.id,
          table_id: table.id,
          status: 'active',
        })
        .select('id')
        .single();

      if (sessionError || !newSession) {
        logApiError('POST /api/session/create - session insert', sessionError);
        return serverError('Failed to create session');
      }

      sessionId = newSession.id;
      isNewSession = true;
    }

    // 4. Create participant
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        session_id: sessionId,
        name: participantName || `Guest ${Date.now().toString(36).slice(-4)}`,
        is_host: isNewSession, // First participant is host
        is_active: true,
      })
      .select('id, name, is_host')
      .single();

    if (participantError || !participant) {
      logApiError('POST /api/session/create - participant insert', participantError);
      return serverError('Failed to join session');
    }

    return NextResponse.json(
      {
        session: {
          id: sessionId,
          slug,
          tableNumber,
          isNew: isNewSession,
        },
        participant: {
          id: participant.id,
          name: participant.name,
          isHost: participant.is_host,
        },
      },
      { status: isNewSession ? 201 : 200 }
    );
  } catch (error) {
    logApiError('POST /api/session/create', error);
    return serverError();
  }
}
