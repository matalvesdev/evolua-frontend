/**
 * Unified Next.js Middleware.
 * Combines authentication, CSP headers, rate limiting, and security headers.
 * Runs on edge runtime — no Node.js-specific APIs.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { generateNonce, buildCSP } from '@/lib/security/csp';
import { checkRateLimit } from '@/lib/security/rate-limit';

const PROTECTED_PREFIX = '/dashboard';
const AUTH_ROUTES = ['/auth/login', '/auth/cadastro'];
const RATE_LIMITED_ROUTES = ['/auth/login', '/auth/cadastro'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Generate CSP nonce
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV === 'development';
  const cspHeader = buildCSP({ nonce, isDev });

  // 2. Rate limiting for sensitive routes
  const rateLimitedRoute = RATE_LIMITED_ROUTES.find(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (rateLimitedRoute) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    const result = await checkRateLimit(ip, rateLimitedRoute);

    if (!result.success) {
      const retryAfter = Math.max(0, Math.ceil(result.reset - Date.now() / 1000));
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Content-Security-Policy': cspHeader,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      });
    }
  }

  // 3. Create Supabase server client and check session
  const supabaseResponse = NextResponse.next({
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
          // Update both request cookies for getUser and response cookies for client
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This will refresh tokens if needed via middleware interceptor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthRoute = pathname === '/auth/login' || pathname.startsWith('/auth/cadastro');

  // 4. Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // 5. Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // 6. Add security headers to the response
  supabaseResponse.headers.set('Content-Security-Policy', cspHeader);
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(self)'
  );
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
