import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Admin client with service role
 *
 * ⚠️ ONLY use in server-side code (API routes, Server Actions)
 * This bypasses RLS - use with caution!
 *
 * Use for:
 * - Admin operations
 * - Backend processes
 * - Operations that need to bypass RLS
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
