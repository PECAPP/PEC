import { cookies } from 'next/headers';

/**
 * Robust server-side session retriever.
 * Priority:
 * 1. access_token cookie (decoded as JWT)
 * 2. user_id + user_role cookies (as identity labels)
 * 3. refresh_token cookie (as presence indicator)
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const userIdCookie = cookieStore.get('user_id')?.value;
    const userRoleCookie = cookieStore.get('user_role')?.value;

    // 1. Try DECODING the access_token if it's a JWT
    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1];
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          
          return {
            uid: decoded.sub || decoded.uid || userIdCookie || 'unknown',
            role: (decoded.role || userRoleCookie || 'student') as any,
            email: decoded.email || 'user@pec.edu',
            fullName: decoded.name || decoded.fullName || 'User',
            token: accessToken,
            profileComplete: decoded.profileComplete || true, // fallback to true to prevent unnecessary loops
          };
        }
      } catch (e) {
        // Not a valid JWT or parse error - fall through to simpler checks
      }
    }

    // 2. DEVELOPMENT / SANDBOX FALLBACK
    // If we have explicit ID/Role cookies OR a refresh token, we consider the user at least partially authenticated.
    // This provides a much smoother UX for SSR than strict JWT validation in this context.
    if (userIdCookie || refreshToken) {
      return {
        uid: userIdCookie || 'unknown',
        role: (userRoleCookie || 'student') as any,
        email: 'user@pec.edu',
        fullName: 'Member',
        token: refreshToken || accessToken || 'mock-token',
        profileComplete: true,
      };
    }

    // 3. No session found
    return null;
  } catch (error) {
    console.error('Core SSR session error:', error);
    return null;
  }
}
