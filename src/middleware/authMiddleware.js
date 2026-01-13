// middleware/authMiddleware.js
import { NextResponse } from 'next/server';

export async function authMiddleware(request) {
  // Now read from the cookie we set
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return null; // Continue
}