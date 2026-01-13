import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Handler
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

  // Redirect to Hub onboarding after successful auth
  const hubUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://hub.localhost:3000/onboarding'
      : `${process.env.NEXT_PUBLIC_HUB_URL}/onboarding`;

  return NextResponse.redirect(hubUrl);
}
