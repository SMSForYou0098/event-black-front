// middleware/authMiddleware.js
import { NextResponse } from 'next/server';
import { isAuthContinuePathname } from '../utils/authContinuePath';

export async function authMiddleware(request) {
  // Now read from the cookie we set
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    const pathname = request.nextUrl.pathname;
    // Let the client resume after Redux → authToken cookie sync (see AppContent).
    if (isAuthContinuePathname(pathname)) {
      const dest = new URL('/', request.url);
      dest.searchParams.set(
        'continue',
        `${pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(dest);
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return null; // Continue
}