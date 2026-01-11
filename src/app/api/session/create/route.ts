import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateBody, serverError, logApiError } from '@/lib/api/validation';

/**
 * Session creation schema
 */
const CreateSessionSchema = z.object({
  slug: z.string().min(1),
  tableNumber: z.string().min(1),
});

/**
 * POST /api/session/create
 *
 * Create or join a payment session for a table.
 * Currently a stub that returns success - full implementation pending.
 */
export async function POST(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, CreateSessionSchema);
    if (validationError) {
      return validationError;
    }

    const { slug, tableNumber } = data;

    // TODO: Implement real session creation with Supabase
    // For now, return a mock session to unblock the flow
    const mockSession = {
      id: `session-${Date.now()}`,
      slug,
      tableNumber,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ session: mockSession }, { status: 201 });
  } catch (error) {
    logApiError('POST /api/session/create', error);
    return serverError();
  }
}
