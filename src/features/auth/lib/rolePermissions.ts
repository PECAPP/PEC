export type UserRole =
  | "student"
  | "faculty"
  | "college_admin";

export interface RolePermissions {
  canViewDashboard: boolean;
  canEditProfile: boolean;
  canAccessCourses: boolean;
  canAccessFinance: boolean;
  canAccessPlacements: boolean;
  canManageUsers: boolean;
  canManageCourses: boolean;
  canManageFinance: boolean;
  canManagePlacements: boolean;
  canAccessAdmin: boolean;
  canAccessReports: boolean;
  canManageInstitution: boolean;
  canManageRecruiters: boolean;
  canSwitchOrganizations?: boolean;
  canViewAllOrganizations?: boolean;
  canManageSystemSettings?: boolean;
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  const basePermissions: RolePermissions = {
    canViewDashboard: false,
    canEditProfile: false,
    canAccessCourses: false,
    canAccessFinance: false,
    canAccessPlacements: false,
    canManageUsers: false,
    canManageCourses: false,
    canManageFinance: false,
    canManagePlacements: false,
    canAccessAdmin: false,
    canAccessReports: false,
    canManageInstitution: false,
    canManageRecruiters: false,
  };

  switch (role) {
    case "student":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canEditProfile: true,
        canAccessCourses: true,
        canAccessFinance: true,
        canAccessPlacements: true,
      };

    case "faculty":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canEditProfile: true,
        canAccessCourses: true,
        canManageCourses: true,
        canAccessReports: true,
      };

    case "college_admin":
      return {
        ...basePermissions,
        canViewDashboard: true,
        canEditProfile: true,
        canAccessCourses: true,
        canAccessFinance: true,
        canAccessPlacements: true,
        canManageUsers: true,
        canManageCourses: true,
        canAccessAdmin: true,
        canAccessReports: true,
        canManageInstitution: true,
        canManageRecruiters: true,
      };

    default:
      return basePermissions;
  }
};

// Utility to check if user has permission
export const hasPermission = (
  userPermissions: RolePermissions,
  requiredPermission: keyof RolePermissions,
): boolean => {
  return userPermissions[requiredPermission] === true;
};

// Utility to check multiple permissions (AND)
export const hasAllPermissions = (
  userPermissions: RolePermissions,
  requiredPermissions: (keyof RolePermissions)[],
): boolean => {
  return requiredPermissions.every((perm) => userPermissions[perm] === true);
};

// Utility to check multiple permissions (OR)
export const hasAnyPermission = (
  userPermissions: RolePermissions,
  requiredPermissions: (keyof RolePermissions)[],
): boolean => {
  return requiredPermissions.some((perm) => userPermissions[perm] === true);
};
