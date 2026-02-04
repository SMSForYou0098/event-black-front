import { NextResponse } from 'next/server';

// Import individual middleware functions
import { queryParamMiddleware } from './middleware/queryParamMiddleware';
import { authMiddleware } from './middleware/authMiddleware';
import { roleBasedMiddleware } from './middleware/roleBasedMiddleware';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  /* =====================================================
   🚫 1. Skip Next.js internal & static requests
  ===================================================== */
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  /* =====================================================
   🔐 2. Auth routes (login / password / success)
  ===================================================== */
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get('authToken')?.value;

    // If already logged in → redirect to home
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  /* =====================================================
   🔍 3. Query param protection (ONLY real pages)
  ===================================================== */
  if (
    pathname.startsWith('/events/checkout/') &&
    !pathname.endsWith('.json')
  ) {
    const queryParamResult = await queryParamMiddleware(request);
    if (queryParamResult) return queryParamResult;
  }

  /* =====================================================
   🔑 4. Authentication for private routes
  ===================================================== */
  if (isPrivateRoute(pathname)) {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;
  }

  /* =====================================================
   🛡 5. Role-based access control
  ===================================================== */
  if (isAdminRoute(pathname)) {
    const roleResult = await roleBasedMiddleware(request);
    if (roleResult) return roleResult;
  }

  // ✅ Allow request to continue
  return NextResponse.next();
}

/* =====================================================
   Helper functions
===================================================== */

function isPrivateRoute(pathname) {
  return (
    pathname.startsWith('/events/checkout') ||
    pathname.startsWith('/events/attendee') ||
    pathname.startsWith('/events/summary') ||
    pathname === '/dashboard' ||
    pathname === '/profile' ||
    pathname.startsWith('/admin')
  );
}

function isAuthRoute(pathname) {
  return (
    pathname === '/auth/auth-success' ||
    pathname === '/auth/lost-password'
  );
}

function isAdminRoute(pathname) {
  return pathname.startsWith('/admin');
}

/* =====================================================
   Middleware matcher
===================================================== */
export const config = {
  matcher: [
    '/auth/:path*',
    '/events/checkout/:path*',
    '/events/attendee/:path*',
    '/events/summary/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ],
};
