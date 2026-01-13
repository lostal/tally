import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-Tenant Proxy (Next.js 16)
 *
 * Routes requests based on hostname to app directories:
 * - hub.* / admin.* -> /hub (Admin, POS)
 * - go.*            -> /go (Customer App)
 * - everything else -> /marketing (Landing)
 *
 * In development (localhost:3000), we use path prefixes instead of subdomains:
 * - /hub/*   -> /hub/*
 * - /go/*    -> /go/*
 * - /*       -> /marketing/*
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname, search } = request.nextUrl;

  // Skip static files, API routes, and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Development mode: Use path-based routing (no subdomains needed)
  const isDev = hostname.includes('localhost');

  if (isDev) {
    // In dev, /hub/* and /go/* are accessed directly
    // Only rewrite root paths to /marketing
    if (pathname.startsWith('/hub') || pathname.startsWith('/go')) {
      return NextResponse.next();
    }
    // Root paths go to marketing
    return NextResponse.rewrite(new URL(`/marketing${pathname}${search}`, request.url));
  }

  // Production: Use subdomain-based routing
  const isGo = hostname.startsWith('go.');
  const isHub = hostname.startsWith('hub.') || hostname.startsWith('admin.');

  if (isGo) {
    return NextResponse.rewrite(new URL(`/go${pathname}${search}`, request.url));
  }

  if (isHub) {
    return NextResponse.rewrite(new URL(`/hub${pathname}${search}`, request.url));
  }

  // Default: Marketing
  return NextResponse.rewrite(new URL(`/marketing${pathname}${search}`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
