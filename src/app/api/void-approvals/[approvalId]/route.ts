import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, notFound } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { createAuditLog, getClientIp, AuditActions, ResourceTypes } from '@/lib/auth/audit';

interface RouteParams {
  params: Promise<{ approvalId: string }>;
}

const ApprovalDecisionSchema = z.object({
  decision: z.enum(['approved', 'denied']),
});

/**
 * PATCH /api/void-approvals/[approvalId]
 *
 * Approve or deny a void order request.
 * Only managers and owners can approve/deny.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { approvalId } = await params;

  // 1. Verify authentication and permissions (only managers/owners can approve)
  const {
    userId,
    restaurantId,
    error: authError,
  } = await verifyApiAuthWithRole(request, 'orders:void');
  if (authError) return authError;

  // 2. Validate body
  const { data, error: validationError } = await validateBody(request, ApprovalDecisionSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient();

  // 3. Get approval request
  const { data: approval } = await adminSupabase
    .from('void_approvals')
    .select('*, order_id, reason')
    .eq('id', approvalId)
    .eq('restaurant_id', restaurantId!)
    .single();

  if (!approval) {
    return notFound('Approval request not found');
  }

  // 4. Check if already resolved
  if (approval.status !== 'pending') {
    return NextResponse.json(
      { error: 'Approval request already resolved', code: 'ALREADY_RESOLVED' },
      { status: 400 }
    );
  }

  // 5. Update approval status
  await adminSupabase
    .from('void_approvals')
    .update({
      status: data.decision,
      approved_by: userId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', approvalId);

  // 6. If approved, void the order
  if (data.decision === 'approved') {
    await adminSupabase
      .from('orders')
      .update({
        status: 'cancelled',
        voided_at: new Date().toISOString(),
        void_reason: approval.reason,
        voided_by: userId!,
      })
      .eq('id', approval.order_id);

    // Create audit log for approval
    await createAuditLog({
      restaurantId: restaurantId!,
      userId: userId!,
      action: AuditActions.APPROVE_VOID,
      resourceType: ResourceTypes.ORDER,
      resourceId: approval.order_id,
      metadata: { approvalId, reason: approval.reason },
      ipAddress: getClientIp(request),
    });
  } else {
    // Create audit log for denial
    await createAuditLog({
      restaurantId: restaurantId!,
      userId: userId!,
      action: AuditActions.DENY_VOID,
      resourceType: ResourceTypes.VOID_APPROVAL,
      resourceId: approvalId,
      metadata: { orderId: approval.order_id },
      ipAddress: getClientIp(request),
    });
  }

  return NextResponse.json({
    success: true,
    decision: data.decision,
    message: `Void request ${data.decision}`,
  });
}
