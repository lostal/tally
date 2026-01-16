import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Handler
 *
 * Handles the OAuth/email confirmation callback from Supabase.
 * This is the single, canonical callback URL for all auth flows.
 *
 * Flow:
 * 1. User signs up or clicks magic link
 * 2. Supabase redirects to /auth/callback?code=xxx
 * 3. We exchange the code for a session
 * 4. Redirect to onboarding or intended destination
 *
 * IMPORTANT: This URL must be whitelisted in Supabase Dashboard:
 * Authentication → URL Configuration → Redirect URLs
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/hub/onboarding';
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Called from a Server Component context - cookies are read-only
              // The middleware will handle setting cookies on the next request
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful auth - redirect to the intended destination
      // Using the origin from the request ensures correct domain
      return NextResponse.redirect(new URL(next, origin));
    }

    // Auth error - redirect to register with error message
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // No code provided - redirect to home
  return NextResponse.redirect(new URL('/', origin));
}
