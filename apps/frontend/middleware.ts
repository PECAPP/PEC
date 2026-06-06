import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight JWT decoder for Edge Runtime
 * Safe for middleware.ts
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Define paths that require authentication
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/faculty") ||
    pathname.startsWith("/departments") ||
    pathname.startsWith("/attendance");

  // 2. Validate session in Edge Runtime
  if (isProtectedPath) {
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      // Store the attempted URL to redirect back after login
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    // Deep validation: check expiration and identity
    const payload = parseJwt(accessToken);
    const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : false;
    const hasIdentity = payload?.sub || payload?.uid;

    if (!payload || isExpired || !hasIdentity) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      url.searchParams.set("error", isExpired ? "session_expired" : "invalid_identity");
      const response = NextResponse.redirect(url);

      // Clean up orphaned or invalid cookie
      response.cookies.delete("access_token");
      return response;
    }
  }

  // 3. Prevent logged in users from visiting /auth
  if (pathname.startsWith("/auth") && accessToken) {
    const payload = parseJwt(accessToken);
    const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : false;
    const hasIdentity = payload?.sub || payload?.uid;

    if (payload && !isExpired && hasIdentity) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/users/:path*',
    '/chat/:path*',
    '/settings/:path*',
    '/faculty/:path*',
    '/departments/:path*',
    '/attendance/:path*',
    '/auth/:path*',
  ],
};

