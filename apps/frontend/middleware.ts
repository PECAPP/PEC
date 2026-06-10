import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromToken } from "./src/lib/session";

export async function middleware(request: NextRequest) {
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

  // 2. Parse session using the unified jose-based decoder
  const session = getSessionFromToken(accessToken);
  const isExpired = session?.exp ? Date.now() >= session.exp * 1000 : false;
  const isValidSession = session && !isExpired;

  // 3. Protect routes
  if (isProtectedPath) {
    if (!isValidSession) {
      // Try transparent refresh before kicking the user out
      const refreshPresent = request.cookies.get("refresh_present")?.value;
      const refreshToken = request.cookies.get("refresh_token")?.value;

      if (refreshPresent || refreshToken) {
        const refreshed = await attemptTokenRefresh(request);
        if (refreshed) {
          // Refresh succeeded — clone the response, set new cookies, let user through
          const response = NextResponse.next();
          response.cookies.set("access_token", refreshed.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60, // 1 hour
          });
          if (refreshed.user) {
            response.cookies.set("user_id", refreshed.user.uid, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });
            response.cookies.set("user_role", refreshed.user.role || "student", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 7 * 24 * 60 * 60,
            });
          }
          return response;
        }
      }

      // No refresh possible — redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      if (session && isExpired) {
        url.searchParams.set("error", "session_expired");
      }
      const response = NextResponse.redirect(url);
      const cookieOptions = {
        path: "/",
        maxAge: 0,
        sameSite: "strict" as const,
        secure: process.env.NODE_ENV === "production",
      };
      response.cookies.set("access_token", "", cookieOptions);
      response.cookies.set("user_id", "", cookieOptions);
      response.cookies.set("user_role", "", cookieOptions);
      return response;
    }
  }

  // 4. Prevent logged-in users from visiting /auth
  if (pathname.startsWith("/auth") && isValidSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Attempt a silent token refresh by calling the backend directly.
 * Returns the new auth payload on success, null on failure.
 */
async function attemptTokenRefresh(
  request: NextRequest
): Promise<{ access_token: string; user?: { uid: string; role: string | null } } | null> {
  try {
    // Build the backend URL for refresh
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "http://backend:4000/api"
        : "http://backend:4000/api");

    const normalizedTarget = backendUrl.replace(/\/$/, "");
    const apiBase = normalizedTarget.endsWith("/api")
      ? normalizedTarget
      : `${normalizedTarget}/api`;

    // Forward cookies from the original request
    const cookieHeader = request.headers.get("cookie") || "";
    const csrfCookie = request.cookies.get("csrf_token")?.value || "";

    const res = await fetch(`${apiBase}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        "x-csrf-token": csrfCookie,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/courses',
    '/courses/:path*',
    '/users',
    '/users/:path*',
    '/chat',
    '/chat/:path*',
    '/settings',
    '/settings/:path*',
    '/faculty',
    '/faculty/:path*',
    '/departments',
    '/departments/:path*',
    '/attendance',
    '/attendance/:path*',
    '/auth',
    '/auth/:path*',
  ],
};
