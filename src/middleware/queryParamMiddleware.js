import { NextResponse } from 'next/server';

export async function queryParamMiddleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Check if the route requires query parameter validation
  const isCheckoutRoute = pathname.match(/^\/events\/checkout\/(.+)$/);
  const isAttendeeRoute = pathname.match(/^\/events\/attendee\/(.+)$/);
  
  if (isCheckoutRoute || isAttendeeRoute) {
    const kParam = searchParams.get('k');
    
    const eventId = isCheckoutRoute ? isCheckoutRoute[1] : isAttendeeRoute[1];
    const redirectUrl = new URL(`/events/cart/${eventId}`, request.url);
    if (!kParam) {
      return NextResponse.redirect(redirectUrl);
    }
    const storedKey = request.cookies.get(`checkoutDataKey_${kParam}`)?.value;
    
    if (!storedKey || storedKey !== kParam) {
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return null; // No redirect needed
}