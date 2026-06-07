import { useAuth } from "@/features/auth/hooks/useAuth";
import { User } from '@pec/shared';
import {
  getUserPermissions,
  UserPermissions,
  isAdmin,
  isFaculty,
  isStudent,
  canManageContent,
} from '@/lib/permissions';

/**
 * Custom hook for accessing user permissions
 * Provides a consistent interface for permission checking across all components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { permissions, isAdmin, isFaculty, loading } = usePermissions();
 *   if (loading) return <Loading />;
 *   return (
 *     <>
 *       {permissions.canManageCourses && <CreateCourseButton />}
 *       {isAdmin && <AdminPanel />}
 *     </>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { user, loading } = useAuth();

  const permissions: UserPermissions = getUserPermissions(user as unknown as User | null);

  return {
    // Permissions object
    permissions,

    // Role checkers
    isAdmin: isAdmin(user as unknown as User | null),
    isFaculty: isFaculty(user as unknown as User | null),
    isStudent: isStudent(user as unknown as User | null),
    canManage: canManageContent(user as unknown as User | null),

    // User info
    user: user as unknown as User | null,
    role: user?.role || null,

    // Loading state
    loading,
  };
}
