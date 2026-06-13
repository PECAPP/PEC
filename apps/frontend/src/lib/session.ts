/**
 * Edge-compatible JWT payload decoder.
 * Does NOT verify the signature — that's the backend's job.
 * This is purely for reading claims (sub, exp, role) on the frontend.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) return null;
      base64 += '='.repeat(4 - pad);
    }

    const jsonStr = typeof atob === 'function'
      ? decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      : Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

const isValidSessionUid = (value: string | undefined): value is string => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === 'unknown') return false;
  return true;
};

export type SessionPayload = {
  uid: string;
  role: string;
  email: string;
  fullName: string;
  token: string;
  profileComplete: boolean;
  exp?: number;
};

/**
 * Universal edge-compatible session decoder.
 * Works in both Edge Runtime (middleware) and Node Runtime (server components).
 * Uses atob (Edge) with Buffer (Node) fallback — no external dependencies.
 */
export function getSessionFromToken(
  accessToken: string | undefined,
  userIdCookie?: string,
  userRoleCookie?: string
): SessionPayload | null {
  if (!accessToken) return null;

  try {
    const decoded = decodeJwtPayload(accessToken);
    if (!decoded) return null;

    const uid = (decoded.sub || decoded.uid || userIdCookie) as string | undefined;

    if (!isValidSessionUid(uid)) {
      return null;
    }

    return {
      uid: uid as string,
      role: (decoded.role || userRoleCookie || 'student') as string,
      email: (decoded.email || 'user@pec.edu') as string,
      fullName: (decoded.name || decoded.fullName || 'User') as string,
      token: accessToken,
      profileComplete: decoded.profileComplete !== false,
      exp: decoded.exp as number | undefined,
    };
  } catch {
    return null;
  }
}
