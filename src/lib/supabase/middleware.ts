import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Create Supabase client for API routes with cookie handling
 *
 * Returns both the client and the response with updated cookies.
 * Always use the returned response to ensure cookies are properly set.
 */
export async function createApiClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Verify user authentication for API routes
 *
 * Returns the user if authenticated, null otherwise.
 * This should be called at the start of protected API routes.
 */
export async function verifyApiAuth(request: NextRequest) {
  const { supabase, response } = await createApiClient(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, response, error };
  }

  return { user, supabase, response, error: null };
}
