import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-Tenant Proxy (Next.js 16)
 *
 * Production-grade subdomain routing following Vercel's official patterns.
 *
 * Routes:
 * - hub.* / admin.* → /hub (Admin Dashboard & POS)
 * - go.*            → /go (Customer Payment App)
 * - root domain     → Landing page (no rewrite needed)
 */

// Environment configuration
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

/**
 * Extract subdomain from request with proper environment handling
 * Following Vercel Platforms official pattern
 */
function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Development environment (localhost)
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Extract subdomain from full URL pattern: http://subdomain.localhost:3000
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header: subdomain.localhost:3000
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle Vercel preview deployments (subdomain---branch.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection (subdomain.yourdomain.com)
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Skip static files, API routes, and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle subdomain routing
  if (subdomain) {
    // Security: Block admin access from subdomains
    if (pathname.startsWith('/admin') || pathname.startsWith('/hub')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Route based on subdomain type
    if (subdomain === 'hub' || subdomain === 'admin') {
      // Hub subdomain: rewrite to admin dashboard
      return NextResponse.rewrite(new URL(`/hub${pathname}`, request.url));
    } else if (subdomain === 'go') {
      // Go subdomain: rewrite to customer app
      return NextResponse.rewrite(new URL(`/go${pathname}`, request.url));
    } else {
      // Custom tenant subdomain: treat as customer app
      // Pattern: restaurant-name.domain.com → /go/restaurant-name
      return NextResponse.rewrite(new URL(`/go/${subdomain}${pathname}`, request.url));
    }
  }

  // Root domain: serve normally (landing page from /app/page.tsx)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. Static files (images, fonts, etc.)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};
