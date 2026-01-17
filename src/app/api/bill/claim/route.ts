import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError } from '@/lib/api/validation';

/**
 * Schema for claiming an item
 */
const ClaimItemSchema = z.object({
  itemId: z.string().uuid(),
  participantId: z.string().uuid(),
  quantity: z.number().int().min(0),
  expectedVersion: z.number().int().min(1),
});

/**
 * Schema for releasing a claimed item
 */
const ReleaseItemSchema = z.object({
  itemId: z.string().uuid(),
  participantId: z.string().uuid(),
});

/**
 * POST /api/bill/claim
 *
 * Claim an item for a participant with optimistic locking.
 * Prevents race conditions when multiple users try to claim the same item.
 */
export async function POST(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, ClaimItemSchema);
    if (validationError) {
      return validationError;
    }

    const { itemId, participantId, quantity, expectedVersion } = data;
    const supabase = createAdminClient();

    // Use the optimistic locking function
    const { data: result, error } = await supabase.rpc('claim_order_item', {
      p_item_id: itemId,
      p_participant_id: participantId,
      p_quantity: quantity,
      p_expected_version: expectedVersion,
    });

    if (error) {
      logApiError('POST /api/bill/claim', error);
      return serverError('Failed to claim item');
    }

    const claimResult = result?.[0];

    if (!claimResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: claimResult?.error_message || 'Claim failed',
          currentVersion: claimResult?.new_version,
        },
        { status: 409 }
      ); // Conflict status for version mismatch
    }

    return NextResponse.json({
      success: true,
      newVersion: claimResult.new_version,
    });
  } catch (error) {
    logApiError('POST /api/bill/claim', error);
    return serverError();
  }
}

/**
 * DELETE /api/bill/claim
 *
 * Release a claimed item.
 * Validates input with Zod and verifies the participant owns the claim.
 */
export async function DELETE(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, ReleaseItemSchema);
    if (validationError) {
      return validationError;
    }

    const { itemId, participantId } = data;
    const supabase = createAdminClient();

    // Verify the participant exists and owns this claim before releasing
    const { data: existingClaim, error: claimCheckError } = await supabase
      .from('order_items')
      .select('id, claimed_by')
      .eq('id', itemId)
      .single();

    if (claimCheckError || !existingClaim) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify ownership: only the participant who claimed it can release it
    if (existingClaim.claimed_by !== participantId) {
      return NextResponse.json(
        { error: 'You can only release items you have claimed' },
        { status: 403 }
      );
    }

    const { data: released, error: releaseError } = await supabase.rpc('release_order_item', {
      p_item_id: itemId,
      p_participant_id: participantId,
    });

    if (releaseError) {
      logApiError('DELETE /api/bill/claim', releaseError);
      return serverError('Failed to release item');
    }

    return NextResponse.json({ success: released });
  } catch (error) {
    logApiError('DELETE /api/bill/claim', error);
    return serverError();
  }
}
