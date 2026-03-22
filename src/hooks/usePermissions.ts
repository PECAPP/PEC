import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getUserPermissions,
  UserPermissions,
  isAdmin,
  isFaculty,
  isStudent,
  canManageContent,
} from "@/lib/permissions";

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

  const permissions: UserPermissions = getUserPermissions(user);

  return {
    // Permissions object
    permissions,

    // Role checkers
    isAdmin: isAdmin(user),
    isFaculty: isFaculty(user),
    isStudent: isStudent(user),
    isPlacementOfficer: false,
    isRecruiter: false,
    canManage: canManageContent(user),

    // User info
    user,
    role: user?.role || null,

    // Loading state
    loading,
  };
}
