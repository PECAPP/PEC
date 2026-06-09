'use client';
import { useEffect, useState } from 'react';
import { RolePermissions, UserRole, getRolePermissions } from '@/features/auth/lib/rolePermissions';
import {  authClient  } from "@pec/api";
import {  buildApiUrl  } from "@pec/api";
import { AppAbility, buildAbilityFor } from '@/lib/casl-ability';
import { safeLocalStorage, safeDocument, safeWindow, isBrowser } from '@/lib/ssr-safe';

export interface CurrentUser {
  id: string;
  uid: string;
  email: string | null;
  fullName: string | null;
  name: string | null;
  role: UserRole | null;
  roles?: string[];
  organizationId?: string;
  department?: string;
  enrollmentNumber?: string;
  permissions: RolePermissions;
  ability?: AppAbility;
  avatar: string | null;
  verified: boolean;
  profileComplete: boolean;
  semester?: number | null;
}

interface UseAuthResult {
  user: CurrentUser | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  ability?: AppAbility;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

const AUTH_CACHE_TTL_MS = 0;

export const clearAuthCache = () => {
  cachedToken = null;
  cachedUser = null;
  cachedAt = 0;
  inFlightRequest = null;
};

let cachedToken: string | null = null;
let cachedUser: CurrentUser | null = null;
let cachedAt = 0;
let inFlightRequest: Promise<CurrentUser | null> | null = null;
let redirectInProgress = false;

const isAllowedRole = (role: string | null | undefined): role is UserRole => {
  return ['student', 'faculty', 'college_admin', 'admin'].includes(role as string);
};


function hasRefreshMarkerCookie(): boolean {
  return safeDocument.hasCookiePrefix('refresh_present=');
}

function isOnAuthPage(): boolean {
  const pathname = safeWindow.getPathname();
  return pathname === '/auth' || pathname.startsWith('/auth/');
}

function safeRedirectToAuth(): void {
  if (!isBrowser()) return;
  if (isOnAuthPage() || redirectInProgress) return;
  redirectInProgress = true;
  safeWindow.navigate('/auth?clear_session=true');
}

async function fetchProfile(token: string, force = false): Promise<CurrentUser | null> {
  const now = Date.now();
  const cacheValid = !force && cachedToken === token && now - cachedAt < AUTH_CACHE_TTL_MS;

  if (cacheValid) {
    return cachedUser;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    const res = await fetch(buildApiUrl(`/v1/auth/profile?t=${Date.now()}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.status === 401 || res.status === 403) {
      safeLocalStorage.remove('auth_user');
      authClient.logout();
      clearAuthCache();
      safeRedirectToAuth();
      return null;
    }

    if (!res.ok) {
      const err = new Error('Failed to fetch profile');
      (err as any).status = res.status;
      throw err;
    }

    const payload = await res.json();
    const userId = payload.id || payload.uid || payload.sub;
    const role = isAllowedRole(payload.role) ? payload.role : null;
    const fullName = payload.fullName || payload.name || 'User';
    const roles = Array.isArray(payload.roles) ? payload.roles : role ? [role] : [];

    const permsRes = await fetch(buildApiUrl(`/v1/auth/me/permissions?t=${Date.now()}`), {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      cache: 'no-store'
    });
    const permsData = permsRes.ok ? await permsRes.json() : { permissions: [] };
    const caslPermissions = permsData.permissions || [];
    const ability = buildAbilityFor(caslPermissions);

    const user: CurrentUser = {
      id: userId,
      uid: userId,
      email: payload.email,
      fullName,
      name: payload.name || fullName,
      role,
      roles,
      organizationId: payload.organizationId || undefined,
      department: payload.department || undefined,
      enrollmentNumber: payload.enrollmentNumber || undefined,
      semester: typeof payload.semester === 'number' ? payload.semester : undefined,
      permissions: getRolePermissions(role || 'student'),
      ability,
      avatar: payload.avatar || null,
      verified: payload.verified || false,
      profileComplete: payload.profileComplete || false,
    };

    cachedToken = token;
    cachedUser = user;
    cachedAt = Date.now();

    return user;
  })();

  try {
    return await inFlightRequest;
  } finally {
    inFlightRequest = null;
  }
}

export function useAuth(): UseAuthResult {
  // SSR-SAFE: All useState initializers return server-safe defaults (null/null/true).
  // The real values are loaded inside the useEffect below, which only runs on the client.
  // This prevents server/client HTML mismatches (hydration errors).
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncUser = async (force = false) => {
      try {
        let currentToken = authClient.getAccessToken();

        if (!currentToken && hasRefreshMarkerCookie()) {
          try {
            currentToken = await authClient.refreshAccessToken();
          } catch (err: any) {
            const status = err.response?.status || err.status;
            if (status !== 429 && !(status >= 500)) {
              currentToken = null;
            } else {
              // It's a transient 500/429 error. We shouldn't force a logout.
              // We'll leave currentToken null but skip the session clear block
              // by re-throwing to let the outer block handle it.
              throw err;
            }
          }
        }

        setToken(currentToken);

        if (!currentToken) {
          clearAuthCache();
          safeLocalStorage.remove('auth_user');
          setUser(null);
          if (mounted) setLoading(false);
          const protectedPrefixes = ['/dashboard', '/courses', '/users', '/chat', '/settings', '/faculty', '/departments', '/attendance'];
          if (protectedPrefixes.some(p => safeWindow.getPathname().startsWith(p))) {
            safeRedirectToAuth();
          }
          return;
        }

        const resolvedUser = await fetchProfile(currentToken, force);

        if (mounted) {
          setUser(resolvedUser);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
        const status = (err as any)?.response?.status || (err as any)?.status;
        console.error('[useAuth] Outer catch hit. Error:', err, 'Status:', status);
        
        if (status !== 429 && !(status >= 500)) {
          authClient.resetSession();
          clearAuthCache();
          safeLocalStorage.remove('auth_user');
          if (mounted) {
            setToken(null);
            setUser(null);
          }
          safeRedirectToAuth();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    syncUser();

    const onAuthChange = () => {
      setLoading(true);
      syncUser(true);
    };

    const onAuthFailed = () => {
      clearAuthCache();
      safeLocalStorage.remove('auth_user');
      setUser(null);
      setToken(null);
      safeRedirectToAuth();
    };

    window.addEventListener('auth-change', onAuthChange);
    window.addEventListener('auth-failed', onAuthFailed);

    // We no longer hydrate from localStorage to prevent client-side privilege spoofing.
    // The UI will securely wait for the backend to return the accurate profile via fetchProfile().
    if (!hasRefreshMarkerCookie()) {
      safeLocalStorage.remove('auth_user');
    }

    // Sync token from authClient (browser-only)
    setToken(authClient.getAccessToken());

    return () => {
      mounted = false;
      window.removeEventListener('auth-change', onAuthChange);
      window.removeEventListener('auth-failed', onAuthFailed);
    };
  }, []);

  const logout = async () => {
    try { await authClient.logout(); } catch (_e) {}
    clearAuthCache();
    safeLocalStorage.remove('auth_user');
    setUser(null);
    setToken(null);
    safeRedirectToAuth();
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authClient.login({ email, password });
      const currentToken = authClient.getAccessToken();
      setToken(currentToken);
      safeWindow.dispatch('auth-change');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    isLoading: loading,
    error,
    isAuthenticated: !!user,
    ability: user?.ability,
    logout,
    login,
  };
}

export function useHasPermission(requiredPermission: keyof RolePermissions): boolean {
  const { user } = useAuth();
  return user?.permissions[requiredPermission] ?? false;
}

export function useHasAllPermissions(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.every((perm) => user.permissions[perm]);
}

export function useHasAnyPermission(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.some((perm) => user.permissions[perm]);
}

export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

export function useIsRole(role: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  if (!user || !user.role) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

export function useAbility() {
  const { user } = useAuth();
  return user?.ability;
}
