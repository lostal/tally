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
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
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

  // Use getUser() instead of getSession() - more secure as it validates with Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return response;
    }

    // Require auth for all other admin routes
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected POS routes
  if (pathname.startsWith('/pos')) {
    // Allow access to login page
    if (pathname === '/pos/login') {
      // If already logged in, redirect to POS home
      if (user) {
        return NextResponse.redirect(new URL('/pos', request.url));
      }
      return response;
    }

    // Require auth for all other POS routes
    if (!user) {
      const loginUrl = new URL('/pos/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*'],
};
