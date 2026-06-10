import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL('/auth', url.origin);
  const response = NextResponse.redirect(redirectUrl);

  const cookieOptions = {
    path: '/',
    maxAge: 0,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
  };

  // Nuke all session cookies natively via Next.js Route Handler
  // This bypasses any middleware cache bugs and guarantees browser deletion
  response.cookies.set('access_token', '', cookieOptions);
  response.cookies.set('refresh_present', '', cookieOptions);
  response.cookies.set('user_id', '', cookieOptions);
  response.cookies.set('user_role', '', cookieOptions);
  response.cookies.set('csrf_token', '', cookieOptions);

  return response;
}
