import { NextResponse } from 'next/server';

/**
 * Hub Auth Callback - Redirect to main callback
 *
 * This route exists for backwards compatibility.
 * All auth callbacks should go through /auth/callback
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Redirect to the canonical auth callback
  const callbackUrl = new URL('/auth/callback', requestUrl.origin);
  if (code) {
    callbackUrl.searchParams.set('code', code);
  }
  callbackUrl.searchParams.set('next', '/hub/onboarding');

  return NextResponse.redirect(callbackUrl);
}
