import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Supabase client for browser/client components
 *
 * Use this in:
 * - Client Components ('use client')
 * - Event handlers
 * - useEffect hooks
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}
