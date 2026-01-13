import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 15 Middleware (Estable y Funcional)
 *
 * Handles subdomain routing for multi-tenant architecture:
 * - hub.localhost:3000 → /hub routes (Admin Dashboard)
 * - go.localhost:3000  → /go routes (Customer App)
 * - localhost:3000     → Marketing site (root)
 */

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';

  // Extract subdomain from host
  if (host.includes('hub.localhost')) return 'hub';
  if (host.includes('go.localhost')) return 'go';

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Hub subdomain: Admin Dashboard
  if (subdomain === 'hub') {
    // Already on /hub path, continue
    if (pathname.startsWith('/hub')) {
      return NextResponse.next();
    }
    // Rewrite to /hub routes
    const url = request.nextUrl.clone();
    url.pathname = `/hub${pathname === '/' ? '' : pathname}`;
    console.log(`🔄 Hub middleware: ${pathname}${search} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // Go subdomain: Customer App
  if (subdomain === 'go') {
    // Already on /go path, continue
    if (pathname.startsWith('/go')) {
      return NextResponse.next();
    }
    // Rewrite to /go routes
    const url = request.nextUrl.clone();
    url.pathname = `/go${pathname === '/' ? '' : pathname}`;
    console.log(`🔄 Go middleware: ${pathname}${search} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // Default: Marketing site (no subdomain)
  return NextResponse.next();
}

// Matcher configuration for performance
export const config = {
  matcher: [
    // Match all request paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
