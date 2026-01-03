import { NextResponse } from 'next/server';

// Import individual middleware functions
import { queryParamMiddleware } from './middleware/queryParamMiddleware';
import { authMiddleware } from './middleware/authMiddleware';
import { roleBasedMiddleware } from './middleware/roleBasedMiddleware';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log('Middleware executed for path:', pathname);
  // 1. Query Parameter Protection (your current requirement)
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get('authToken')?.value;
    // If user is logged in, redirect to home/dashboard
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  const queryParamResult = await queryParamMiddleware(request);
  if (queryParamResult) return queryParamResult;



  // 2. Authentication Check for private routes
  if (isPrivateRoute(pathname)) {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;
  }

  // 3. Role-based access control
  if (isAdminRoute(pathname)) {
    const roleResult = await roleBasedMiddleware(request);
    if (roleResult) return roleResult;
  }

  // Continue to the page if all checks pass
  return NextResponse.next();
}

// Helper functions to determine route types
function isPrivateRoute(pathname) {
  const privateRoutes = [
    '/events/checkout/:path*',
    '/events/attendee/:path*',
    '/events/summary/:path*',
    '/dashboard',
    '/profile',
    '/admin',
    '/events/checkout',
    '/events/attendee'
  ];
  return privateRoutes.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname) {
  const authRoutes = [
    '/auth/auth-success',
    '/auth/lost-password',
  ];
  return authRoutes.some(route => pathname === route);
}

function isAdminRoute(pathname) {
  return pathname.startsWith('/admin');
}

function isQueryProtectedRoute(pathname) {
  return pathname.includes('/events/checkout/') || pathname.includes('/events/attendee/');
}

export const config = {
  matcher: [
    // Auth routes
    '/auth/:path*',
    // Include all routes that need any kind of middleware
    '/events/checkout/:path*',
    '/events/attendee/:path*',
    '/events/summary/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ]
};