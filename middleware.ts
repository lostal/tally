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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  console.log(`🔍 MIDDLEWARE EJECUTADO: ${host}${pathname}${search}`);

  // Hub subdomain detection
  if (host.includes('hub.localhost')) {
    if (pathname.startsWith('/hub')) {
      console.log('✅ Ya está en /hub, continuando...');
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/hub${pathname === '/' ? '' : pathname}`;
    console.log(`🔄 REWRITE: ${host}${pathname} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // Go subdomain detection
  if (host.includes('go.localhost')) {
    if (pathname.startsWith('/go')) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/go${pathname === '/' ? '' : pathname}`;
    console.log(`🔄 REWRITE: ${host}${pathname} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  console.log('⏭️ Sin subdomain, continuando...');
  return NextResponse.next();
}

// Matcher configuration for performance
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
