import type { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { verifyApiAuth } from '@/lib/supabase/middleware';
import { forbidden } from '@/lib/api/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ApiError } from '@/lib/api/validation';

/**
 * Permission types for RBAC
 */
export type Permission =
  | 'orders:read'
  | 'orders:create'
  | 'orders:void'
  | 'orders:refund'
  | 'menu:read'
  | 'menu:write'
  | 'users:manage'
  | 'reports:view'
  | 'settings:manage';

/**
 * User roles
 */
export type Role = 'owner' | 'manager' | 'waiter';

/**
 * Role-based permission mapping
 *
 * - owner: All permissions
 * - manager: Can manage orders, menu, and view reports, but not manage users or settings
 * - waiter: Can only read and create orders and menu
 */
const ROLE_PERMISSIONS: Record<Role, Permission[] | '*'> = {
  owner: '*', // All permissions
  manager: [
    'orders:read',
    'orders:create',
    'orders:void',
    'orders:refund',
    'menu:read',
    'menu:write',
    'reports:view',
  ],
  waiter: ['orders:read', 'orders:create', 'menu:read'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  // Owner has all permissions
  if (permissions === '*') return true;

  // Check if permission is in the role's permission list
  return permissions.includes(permission);
}

/**
 * Return type for verifyApiAuthWithRole
 */
export interface AuthResult {
  user: User | null;
  role: Role | null;
  restaurantId: string | null;
  userId: string | null;
  supabase: Awaited<ReturnType<typeof verifyApiAuth>>['supabase'];
  response: Awaited<ReturnType<typeof verifyApiAuth>>['response'];
  error: NextResponse<ApiError> | null;
}

/**
 * Verify API authentication with role-based access control
 *
 * This function extends verifyApiAuth to include role verification and permission checks.
 * It returns the user, their role, restaurant ID, and user ID if authorized.
 *
 * @param request - The incoming NextRequest
 * @param requiredPermission - Optional permission to check (e.g., 'orders:void')
 * @returns Object with user, role, restaurantId, userId, supabase client, and error (if any)
 */
export async function verifyApiAuthWithRole(
  request: NextRequest,
  requiredPermission?: Permission
): Promise<AuthResult> {
  // First verify basic authentication
  const { user, supabase, response, error } = await verifyApiAuth(request);

  if (error || !user) {
    return {
      user: null,
      role: null,
      restaurantId: null,
      userId: null,
      supabase,
      response,
      error: forbidden('Unauthorized'),
    };
  }

  // Get user data including role and restaurant_id
  const adminSupabase = createAdminClient();
  const { data: userData, error: userError } = await adminSupabase
    .from('users')
    .select('role, restaurant_id, id')
    .eq('auth_id', user.id)
    .single();

  if (userError || !userData) {
    return {
      user: null,
      role: null,
      restaurantId: null,
      userId: null,
      supabase,
      response,
      error: forbidden('User not found or not associated with a restaurant'),
    };
  }

  const role = userData.role as Role;

  // If a specific permission is required, verify it
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return {
      user,
      role,
      restaurantId: userData.restaurant_id,
      userId: userData.id,
      supabase,
      response,
      error: forbidden(`Permission denied. Required: ${requiredPermission}`),
    };
  }

  // All checks passed
  return {
    user,
    role,
    restaurantId: userData.restaurant_id,
    userId: userData.id,
    supabase,
    response,
    error: null,
  };
}

/**
 * Type for the successful auth result
 */
export interface AuthWithRole {
  user: NonNullable<Awaited<ReturnType<typeof verifyApiAuth>>['user']>;
  role: Role;
  restaurantId: string;
  userId: string;
  supabase: NonNullable<Awaited<ReturnType<typeof verifyApiAuth>>['supabase']>;
  response: NonNullable<Awaited<ReturnType<typeof verifyApiAuth>>['response']>;
}
