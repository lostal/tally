import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, notFound } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { createAuditLog, getClientIp, AuditActions, ResourceTypes } from '@/lib/auth/audit';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

const RequestVoidSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

/**
 * POST /api/orders/[orderId]/void
 *
 * Request to void an order.
 * - Managers and owners can void immediately
 * - Waiters must create an approval request
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;

  // 1. Verify authentication and permissions
  const {
    role,
    restaurantId,
    userId,
    error: authError,
  } = await verifyApiAuthWithRole(request, 'orders:void');
  if (authError) return authError;

  // 2. Validate body
  const { data, error: validationError } = await validateBody(request, RequestVoidSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient();

  // 3. Verify order exists and belongs to restaurant
  const { data: order } = await adminSupabase
    .from('orders')
    .select('status, restaurant_id')
    .eq('id', orderId)
    .eq('restaurant_id', restaurantId!)
    .single();

  if (!order) return notFound('Order not found');

  // 4. Check if already voided
  if (order.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Order is already voided', code: 'ALREADY_VOIDED' },
      { status: 400 }
    );
  }

  // 5. Manager/Owner: void directly
  if (role === 'owner' || role === 'manager') {
    await adminSupabase
      .from('orders')
      .update({
        status: 'cancelled',
        voided_at: new Date().toISOString(),
        void_reason: data.reason,
        voided_by: userId!,
      })
      .eq('id', orderId);

    // Create audit log
    await createAuditLog({
      restaurantId: restaurantId!,
      userId: userId!,
      action: AuditActions.VOID_ORDER,
      resourceType: ResourceTypes.ORDER,
      resourceId: orderId,
      metadata: { reason: data.reason, role },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({
      success: true,
      approved: true,
      message: 'Order voided successfully',
    });
  }

  // 6. Waiter: create approval request
  const { data: approval } = await adminSupabase
    .from('void_approvals')
    .insert({
      restaurant_id: restaurantId!,
      order_id: orderId,
      requested_by: userId!,
      reason: data.reason,
    })
    .select('id')
    .single();

  return NextResponse.json({
    success: true,
    approved: false,
    approvalId: approval?.id,
    message: 'Void request submitted for manager approval',
  });
}
