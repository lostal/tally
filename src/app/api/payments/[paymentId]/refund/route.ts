import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, notFound, forbidden } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { createAuditLog, getClientIp, AuditActions, ResourceTypes } from '@/lib/auth/audit';

interface RouteParams {
  params: Promise<{ paymentId: string }>;
}

const RefundSchema = z.object({
  amountCents: z.number().int().positive().optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

/**
 * POST /api/payments/[paymentId]/refund
 *
 * Refund a payment (full or partial).
 * Only managers and owners can process refunds.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { paymentId } = await params;

  // 1. Verify authentication and permissions
  const {
    userId,
    restaurantId,
    error: authError,
  } = await verifyApiAuthWithRole(request, 'orders:refund');
  if (authError) return authError;

  // 2. Validate body
  const { data, error: validationError } = await validateBody(request, RefundSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient();

  // 3. Get payment and verify it belongs to user's restaurant
  const { data: payment } = await adminSupabase
    .from('payments')
    .select(
      `
      id,
      amount_cents,
      refunded_at,
      payment_session:payment_sessions(
        order:orders(restaurant_id)
      )
    `
    )
    .eq('id', paymentId)
    .single();

  if (!payment) {
    return notFound('Payment not found');
  }

  // Verify restaurant ownership
  const session = payment.payment_session as { order: { restaurant_id: string } | null } | null;
  const order = session?.order;
  if (order?.restaurant_id !== restaurantId) {
    return forbidden('Access denied to this payment');
  }

  // 4. Check if already refunded
  if (payment.refunded_at) {
    return NextResponse.json(
      { error: 'Payment already refunded', code: 'ALREADY_REFUNDED' },
      { status: 400 }
    );
  }

  // 5. Determine refund amount (full or partial)
  const refundAmount = data.amountCents || payment.amount_cents;

  // Validate refund amount doesn't exceed original payment
  if (refundAmount > payment.amount_cents) {
    return NextResponse.json(
      { error: 'Refund amount exceeds payment amount', code: 'INVALID_AMOUNT' },
      { status: 400 }
    );
  }

  // 6. Update payment with refund info
  await adminSupabase
    .from('payments')
    .update({
      refunded_at: new Date().toISOString(),
      refund_reason: data.reason,
      refunded_by: userId,
      refund_amount_cents: refundAmount,
      status: 'refunded',
    })
    .eq('id', paymentId);

  // 7. Create audit log
  await createAuditLog({
    restaurantId: restaurantId!,
    userId: userId!,
    action: AuditActions.REFUND_PAYMENT,
    resourceType: ResourceTypes.PAYMENT,
    resourceId: paymentId,
    metadata: {
      reason: data.reason,
      amountCents: refundAmount,
      originalAmount: payment.amount_cents,
      isPartial: refundAmount < payment.amount_cents,
    },
    ipAddress: getClientIp(request),
  });

  // TODO: Process actual refund with payment provider (Stripe)
  // This would involve calling stripe.refunds.create() with the payment intent ID
  // For now, we're just marking it as refunded in our database

  return NextResponse.json({
    success: true,
    refundAmount: refundAmount,
    message: `Refunded €${(refundAmount / 100).toFixed(2)}`,
  });
}
