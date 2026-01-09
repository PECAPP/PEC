import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { RolePermissions, UserRole } from '@/lib/rolePermissions';

export interface CurrentUser {
  uid: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  department?: string;
  permissions: RolePermissions;
  avatar: string | null;
  verified: boolean;
  profileComplete: boolean;
}

interface UseAuthResult {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('User data not found');
          setUser(null);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          fullName: userData.fullName,
          role: userData.role as UserRole,
          department: userData.department,
          permissions: userData.permissions,
          avatar: userData.avatar,
          verified: userData.verified,
          profileComplete: userData.profileComplete,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
}

// Hook to check specific permission
export function useHasPermission(requiredPermission: keyof RolePermissions): boolean {
  const { user } = useAuth();
  return user?.permissions[requiredPermission] ?? false;
}

// Hook to check multiple permissions (AND)
export function useHasAllPermissions(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.every(perm => user.permissions[perm]);
}

// Hook to check multiple permissions (OR)
export function useHasAnyPermission(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.some(perm => user.permissions[perm]);
}

// Hook to check user role
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

// Hook to check if user is specific role
export function useIsRole(role: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}
