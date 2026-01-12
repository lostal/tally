import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-Tenant Middleware (Standard Pattern)
 *
 * Rewrites requests based on the hostname to specific app directories:
 * - hub.paytally.app -> /hub (Admin, POS)
 * - go.paytally.app  -> /go (Customer App)
 * - paytally.app     -> /marketing (Landing)
 *
 * This architecture ensures strict separation and prevents route collisions.
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const pathname = url.pathname;

  // 1. Skip Static/API/Internal Paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Identify Domain
  const isGo = hostname.startsWith('go.');
  const isHub =
    hostname.startsWith('hub.') || hostname.startsWith('admin.') || hostname.includes('localhost');
  // ^ Treating localhost as Hub for ease of dev (access other apps via localhost/go/...)
  // OR we can rely on subdomains locally too: go.localhost:3000

  // 3. Rewrite Logic
  // We explicitly rewrite the URL path to point to the namespaced folder in /app

  if (isGo) {
    // go.paytally.app/slug -> /go/slug
    return NextResponse.rewrite(new URL(`/go${pathname}`, request.url));
  }

  if (isHub || hostname.includes('localhost')) {
    // hub.paytally.app/admin -> /hub/admin
    // Special Case: Localhost might want to access landing?
    // For now, let's treat localhost ROOT as Hub dashboard trigger OR marketing?
    // User wants "cleanest solution".
    // Usually:
    // localhost:3000 -> Marketing
    // hub.localhost:3000 -> Hub
    // go.localhost:3000 -> Go

    // Let's refine localhost logic to be strict if possible, but fallback to marketing if plain localhost?
    if (hostname === 'localhost:3000') {
      // Root localhost = Marketing
      return NextResponse.rewrite(new URL(`/marketing${pathname}`, request.url));
    }

    // Otherwise fallback to Hub (hub.localhost or hub.paytally.app)
    // Fix: If I rewrite to /hub/admin, Next.js finds src/app/hub/admin
    return NextResponse.rewrite(new URL(`/hub${pathname}`, request.url));
  }

  // Default: Marketing
  // paytally.app -> /marketing
  return NextResponse.rewrite(new URL(`/marketing${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
