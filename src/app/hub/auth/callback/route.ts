import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Handler for Hub
 *
 * Handles the OAuth/email confirmation callback from Supabase.
 * Exchanges the code for a session and redirects to onboarding.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to onboarding after successful auth
  return NextResponse.redirect(new URL('/hub/onboarding', request.url));
}
