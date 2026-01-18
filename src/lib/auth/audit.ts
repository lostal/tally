import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';

/**
 * Parameters for creating an audit log entry
 */
export interface AuditLogParams {
  restaurantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Create an audit log entry for tracking privileged operations
 *
 * This function records important actions like voiding orders, refunding payments,
 * updating menu items, etc. It uses the admin client to bypass RLS policies.
 *
 * @param params - Audit log parameters
 * @returns Promise that resolves when the log is created
 *
 * @example
 * await createAuditLog({
 *   restaurantId: '123',
 *   userId: '456',
 *   action: 'void_order',
 *   resourceType: 'order',
 *   resourceId: '789',
 *   metadata: { reason: 'Customer request' },
 *   ipAddress: '192.168.1.1'
 * });
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('audit_logs').insert({
    restaurant_id: params.restaurantId,
    user_id: params.userId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    metadata: (params.metadata || {}) as Json,
    ip_address: params.ipAddress,
  });

  if (error) {
    console.error('[Audit Log] Failed to create audit log:', error);
    // Don't throw - we don't want audit logging failures to break the main operation
  }
}

/**
 * Extract client IP address from request headers
 *
 * Checks common headers used by proxies and CDNs to determine the original client IP.
 *
 * @param request - The incoming HTTP request
 * @returns IP address or 'unknown' if not found
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for first (common in proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  // Try x-real-ip (used by nginx and others)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
}

/**
 * Common audit log actions
 */
export const AuditActions = {
  // Order actions
  VOID_ORDER: 'void_order',
  APPROVE_VOID: 'approve_void',
  DENY_VOID: 'deny_void',

  // Payment actions
  REFUND_PAYMENT: 'refund_payment',

  // Menu actions
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',

  // User actions
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  CHANGE_USER_ROLE: 'change_user_role',

  // Settings actions
  UPDATE_RESTAURANT_SETTINGS: 'update_restaurant_settings',
} as const;

/**
 * Common resource types
 */
export const ResourceTypes = {
  ORDER: 'order',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  USER: 'user',
  RESTAURANT: 'restaurant',
  VOID_APPROVAL: 'void_approval',
} as const;
