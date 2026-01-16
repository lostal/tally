import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tally Middleware
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session on every request
 * 2. Protect /hub/* routes - redirect to login if unauthenticated
 * 3. Allow public routes to pass through
 *
 * Architecture: Path-based routing (no subdomains)
 * See docs/ROUTING.md for full URL structure
 */

// Routes that require authentication
const PROTECTED_PATTERNS = [
  /^\/hub\/admin(?!\/login)/, // /hub/admin/* except /hub/admin/login
  /^\/hub\/pos(?!\/login)/, // /hub/pos/* except /hub/pos/login
  /^\/hub\/kds/, // /hub/kds/*
  /^\/hub\/onboarding/, // /hub/onboarding/*
  /^\/hub\/register/, // /hub/register/*
];

// Routes that should skip middleware entirely (performance)
const PUBLIC_PATTERNS = [
  /^\/_next/, // Next.js internals
  /^\/favicon\.ico/, // Favicon
  /^\/manifest/, // PWA manifest
  /^\/api\//, // API routes (have own auth)
  /^\/auth\//, // Auth callbacks
  /^\/go\//, // Customer-facing (public via QR)
];

// Login redirects by route type
const LOGIN_ROUTES: Record<string, string> = {
  admin: '/hub/admin/login',
  pos: '/hub/pos/login',
  kds: '/hub/pos/login',
  onboarding: '/hub/admin/login',
  register: '/hub/admin/login',
};

function getLoginRoute(pathname: string): string {
  const segment = pathname.split('/')[2]; // /hub/{segment}/...
  return LOGIN_ROUTES[segment] || '/hub/admin/login';
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Create response that we'll modify with cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Create new response with updated cookies
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          // Set cookies on response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session - IMPORTANT: This must happen on every request
  // to keep the auth session alive and update the cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    if (!user) {
      // Redirect to appropriate login page with return URL
      const loginUrl = new URL(getLoginRoute(pathname), request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For /hub root without auth, redirect to login
  if (pathname === '/hub' || pathname === '/hub/') {
    if (!user) {
      return NextResponse.redirect(new URL('/hub/admin/login', request.url));
    }
    // If authenticated, redirect to admin dashboard
    return NextResponse.redirect(new URL('/hub/admin', request.url));
  }

  return response;
}

// Matcher: Run on all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
