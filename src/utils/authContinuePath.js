/**
 * Allowed targets for ?continue= after middleware sends users to / (cookie sync race).
 * Must stay aligned with isPrivateRoute in src/middleware.js.
 */
export function isAuthContinuePathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;
  return (
    pathname.startsWith('/events/checkout') ||
    pathname.startsWith('/events/attendee') ||
    pathname.startsWith('/events/summary') ||
    pathname === '/dashboard' ||
    pathname === '/profile' ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/admin')
  );
}

/**
 * @param {string} raw — value from ?continue= (may be URL-encoded)
 * @returns {string|null} safe path + query or null
 */
export function parseSafeContinuePath(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!decoded.startsWith('/')) return null;
  if (decoded.startsWith('//')) return null;
  const pathname = decoded.split('?')[0];
  if (!isAuthContinuePathname(pathname)) return null;
  return decoded;
}
