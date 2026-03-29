import { User } from "@/types";

/**
 * Permission utility functions for role-based access control
 * Provides consistent permission checking across the application
 */
export interface UserPermissions {
  // View permissions
  canViewDashboard: boolean;
  canAccessCourses: boolean;
  canAccessFinance: boolean;
  canAccessReports: boolean;
  canAccessAdmin: boolean;
  canEditProfile: boolean;
  canManageCourses: boolean;
  canManageUsers: boolean;
  canManageFinance: boolean;
  canManageInstitution: boolean;
}

/**
 * Get permissions object for a user based on their role
 */
export function getUserPermissions(user: User | null): UserPermissions {
  if (!user) {
    return getDefaultPermissions();
  }

  // If permissions are already in user object, return them
  if ((user as any).permissions) {
    return (user as any).permissions as UserPermissions;
  }

  // Otherwise, derive from role
  return getRolePermissions(user.role);
}

/**
 * Get default (no access) permissions
 */
function getDefaultPermissions(): UserPermissions {
  return {
    canViewDashboard: false,
    canAccessCourses: false,
    canAccessFinance: false,
    canAccessReports: false,
    canAccessAdmin: false,
    canEditProfile: false,
    canManageCourses: false,
    canManageUsers: false,
    canManageFinance: false,
    canManageInstitution: false,
  };
}

/**
 * Get permissions based on role
 */
export function getRolePermissions(role: string): UserPermissions {
  const basePermissions = getDefaultPermissions();

  switch (role) {
    case "college_admin":
    case "admin":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canAccessCourses: true,
        canAccessFinance: true,
        canAccessReports: true,
        canAccessAdmin: true,
        canEditProfile: true,
        canManageCourses: true,
        canManageUsers: true,
        canManageFinance: true,
        canManageInstitution: true,
      };

    case "faculty":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canAccessCourses: true,
        canAccessFinance: true,
        canAccessReports: true,
        canAccessAdmin: true,
        canEditProfile: true,
        canManageCourses: true,
        canManageUsers: true,
        canManageFinance: true,
        canManageInstitution: true,
      };

    case "student":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canAccessCourses: true,
        canAccessFinance: true,
        canEditProfile: true,
      };

    default:
      return basePermissions;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return ["college_admin", "admin", "faculty"].includes(
    user?.role || "",
  );
}

/**
 * Check if user is faculty
 */
export function isFaculty(user: User | null): boolean {
  return user?.role === "faculty";
}

/**
 * Check if user is student
 */
export function isStudent(user: User | null): boolean {
  return user?.role === "student";
}

/**
 * Check if user is placement officer
 */
export function isPlacementOfficer(user: User | null): boolean {
  return false;
}

/**
 * Check if user is recruiter
 */
export function isRecruiter(user: User | null): boolean {
  return false;
}

/**
 * Check if user can manage (admin or faculty)
 */
export function canManageContent(user: User | null): boolean {
  return isAdmin(user) || isFaculty(user);
}
