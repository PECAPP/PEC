'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { RolePermissions, UserRole, getRolePermissions } from '@/features/auth/lib/rolePermissions';
import { authClient, default as api } from "@pec/api";
import { AppAbility, buildAbilityFor } from '@/lib/casl-ability';
import { safeLocalStorage, safeWindow, isBrowser } from '@/lib/ssr-safe';

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
  caslPermissions?: import('@/lib/casl-ability').CaslPermission[];
  avatar: string | null;
  verified: boolean;
  profileComplete: boolean;
  semester?: number | null;
  isTwoFactorEnabled?: boolean;
}

export interface UseAuthResult {
  user: CurrentUser | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  ability?: AppAbility;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  login2FA: (userId: string, token: string) => Promise<void>;
}

export const clearAuthCache = () => {};

const AuthContext = createContext<UseAuthResult | undefined>(undefined);

function isOnAuthPage(): boolean {
  const pathname = safeWindow.getPathname();
  return pathname === '/auth' || pathname.startsWith('/auth/');
}

let redirectInProgress = false;

async function safeRedirectToAuth(): Promise<void> {
  if (!isBrowser()) return;
  if (isOnAuthPage() || redirectInProgress) return;
  redirectInProgress = true;
  try {
    // Call clear-session via fetch so it clears HttpOnly cookies server-side,
    // but we handle the navigation ourselves so the user never lands on /api/...
    await fetch('/api/auth/clear-session', { redirect: 'manual' });
  } catch {
    // Best-effort — proceed with redirect regardless
  }
  safeWindow.navigate('/auth');
}

export function AuthProvider({ children, initialSession }: { children: ReactNode, initialSession: CurrentUser | null }) {
  console.log('AuthProvider rendered with initialSession:', initialSession ? initialSession.uid : null);
  
  const hydratedSession = initialSession ? {
    ...initialSession,
    ability: buildAbilityFor(initialSession.caslPermissions, initialSession.role)
  } : null;

  const [user, setUser] = useState<CurrentUser | null>(hydratedSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const onAuthFailed = () => {
      safeLocalStorage.remove('auth_user');
      setUser(null);
      safeRedirectToAuth();
    };

    window.addEventListener('auth-failed', onAuthFailed);

    // Initial settings sync
    if (user && isBrowser()) {
      api.get('/settings').then(res => {
        const data = res.data?.success ? res.data.data : res.data;
        if (data?.theme && data.theme !== theme) {
          setTheme(data.theme);
        }
        if (data?.accentColor) {
          const root = document.documentElement;
          root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-pec-gold');
          root.classList.add(`accent-${data.accentColor}`);
          localStorage.setItem('accent-color', data.accentColor);
          document.cookie = `accent-color=${data.accentColor}; path=/; max-age=31536000`;
          window.dispatchEvent(new StorageEvent('storage', { key: 'accent-color', newValue: data.accentColor }));
        }
      }).catch(err => console.error('Failed to sync settings:', err));
    }

    return () => window.removeEventListener('auth-failed', onAuthFailed);
  }, [user?.uid]);

  const logout = async () => {
    try { await authClient.logout(); } catch (_e) {}
    safeLocalStorage.remove('auth_user');
    setUser(null);
    await safeRedirectToAuth();
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authClient.login({ email, password });
      if ((res as any).requires2FA) {
        return res; // Return to component to handle TOTP step
      }
      window.location.href = '/dashboard';
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login2FA = async (userId: string, token: string) => {
    setLoading(true);
    try {
      await authClient.login2FA({ userId, token });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoading: loading,
      error,
      isAuthenticated: !!user,
      ability: user?.ability,
      logout,
      login,
      login2FA
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): UseAuthResult {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
