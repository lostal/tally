import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js 16 Proxy
 *
 * Protects admin and POS routes by checking for valid Supabase session.
 * Uses getUser() for secure server-side auth verification.
 *
 * Note: proxy.ts is not a security boundary - also validate auth
 * in your API routes and Server Components.
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Define domains
  const isGo = hostname.startsWith('go.');
  const isMarketing = hostname === 'paytally.app' || hostname.startsWith('www.');
  const isHub =
    hostname.startsWith('hub.') || hostname.startsWith('admin.') || hostname.includes('localhost');

  // Authentication Check (Existing Logic)
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected Routes Logic
  // Check original pathname for admin/pos protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (user) return NextResponse.redirect(new URL('/admin', request.url));
    } else if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/pos')) {
    if (pathname === '/pos/login') {
      if (user) return NextResponse.redirect(new URL('/pos', request.url));
    } else if (!user) {
      const loginUrl = new URL('/pos/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rewrite Logic
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return response;
  }

  if (isGo) {
    return NextResponse.rewrite(new URL(`/(go)${pathname}`, request.url), response);
  }

  if (isMarketing) {
    return NextResponse.rewrite(new URL(`/(marketing)${pathname}`, request.url), response);
  }

  // Default to Hub (includes localhost)
  // We rewrite to (hub) to ensure file access if they are physically there
  if (isHub || hostname.includes('localhost')) {
    return NextResponse.rewrite(new URL(`/(hub)${pathname}`, request.url), response);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*'],
};
