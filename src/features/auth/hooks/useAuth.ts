import { useEffect, useState } from "react";
import {
  RolePermissions,
  UserRole,
  getRolePermissions,
} from "@/features/auth/lib/rolePermissions";
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

const AUTH_CACHE_TTL_MS = 30_000;

let cachedToken: string | null = null;
let cachedUser: CurrentUser | null = null;
let cachedAt = 0;
let inFlightRequest: Promise<CurrentUser | null> | null = null;

const isAllowedRole = (role: string | null | undefined): role is UserRole => {
  return [
    "student",
    "faculty",
    "college_admin",
    "admin",
    "moderator",
    "user",
  ].includes(role as string);
};

function clearAuthCache() {
  cachedToken = null;
  cachedUser = null;
  cachedAt = 0;
  inFlightRequest = null;
}

async function fetchProfile(
  token: string,
  force = false,
): Promise<CurrentUser | null> {
  const now = Date.now();
  const cacheValid =
    !force && cachedToken === token && now - cachedAt < AUTH_CACHE_TTL_MS;

  if (cacheValid) {
    return cachedUser;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      authClient.logout();
      clearAuthCache();
      return null;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    const payload = await res.json();
    const userId = payload.id || payload.uid || payload.sub;
    const role = isAllowedRole(payload.role) ? payload.role : null;
    const fullName = payload.fullName || payload.name || "User";
    const roles = Array.isArray(payload.roles)
      ? payload.roles
      : role
        ? [role]
        : [];

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
      semester:
        typeof payload.semester === "number" ? payload.semester : undefined,
      permissions: getRolePermissions(role || "user"),
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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    authClient.getAccessToken(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncUser = async (force = false) => {
      try {
        let currentToken = authClient.getAccessToken();

        if (!currentToken) {
          try {
            currentToken = await authClient.refreshAccessToken();
          } catch {
            currentToken = null;
          }
        }
        setToken(currentToken);

        if (!currentToken) {
          clearAuthCache();
          setUser(null);
          if (mounted) {
            setLoading(false);
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
          setError(err instanceof Error ? err.message : "An error occurred");
        }
        await authClient.logout();
        clearAuthCache();
        if (mounted) {
          setToken(null);
          setUser(null);
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
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth-change", onAuthChange);
    window.addEventListener("auth-failed", onAuthFailed);

    return () => {
      mounted = false;
      window.removeEventListener("auth-change", onAuthChange);
      window.removeEventListener("auth-failed", onAuthFailed);
    };
  }, []);

  const logout = async () => {
    await authClient.logout();
    clearAuthCache();
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authClient.login({ email, password });
      const currentToken = authClient.getAccessToken();
      setToken(currentToken);
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
    logout,
    login,
  };
}

export function useHasPermission(
  requiredPermission: keyof RolePermissions,
): boolean {
  const { user } = useAuth();
  return user?.permissions[requiredPermission] ?? false;
}

export function useHasAllPermissions(
  requiredPermissions: (keyof RolePermissions)[],
): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.every((perm) => user.permissions[perm]);
}

export function useHasAnyPermission(
  requiredPermissions: (keyof RolePermissions)[],
): boolean {
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
