import { NextResponse } from 'next/server';

// Import individual middleware functions
import { queryParamMiddleware } from './middleware/queryParamMiddleware';
import { authMiddleware } from './middleware/authMiddleware';
import { roleBasedMiddleware } from './middleware/roleBasedMiddleware';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Query Parameter Protection (your current requirement)
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

function isAdminRoute(pathname) {
  return pathname.startsWith('/admin');
}

function isQueryProtectedRoute(pathname) {
  return pathname.includes('/events/checkout/') || pathname.includes('/events/attendee/');
}

export const config = {
  matcher: [
    // Include all routes that need any kind of middleware
    '/events/checkout/:path*',
    '/events/attendee/:path*',
    '/events/summary/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ]
};