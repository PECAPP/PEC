import { usePermissions } from "./usePermissions";

/**
 * Department-based filtering hook
 * Returns filtered queries based on user role and department
 */
export function useDepartmentFilter() {
  const { user, isAdmin, isFaculty, isPlacementOfficer } = usePermissions();

  /**
  * Get department filter for backend queries
   * Admin: No filter (see all)
   * Faculty/Placement: Filter by their department
   * Student: Filter by their department
   */
  const getDepartmentFilter = () => {
    if (isAdmin) {
      return null; // No filter for admin
    }
    return (user as any)?.department || null;
  };

  /**
   * Check if user can edit/manage a specific item based on department
   */
  const canManageItem = (itemDepartment: string) => {
    if (isAdmin) return true; // Admin can manage all
    const userDept = (user as any)?.department;
    if (!userDept) return false;
    return userDept === itemDepartment;
  };

  /**
   * Check if user can view a specific item
   */
  const canViewItem = (itemDepartment: string) => {
    if (isAdmin || isPlacementOfficer) return true; // Can view all
    const userDept = (user as any)?.department;
    if (!userDept) return false;
    return userDept === itemDepartment;
  };

  /**
   * Filter an array of items by department
   */
  const filterByDepartment = <T extends { department?: string }>(
    items: T[],
  ): T[] => {
    if (isAdmin || isPlacementOfficer) return items; // No filter
    const userDept = (user as any)?.department;
    if (!userDept) return [];
    return items.filter((item) => item.department === userDept);
  };

  return {
    userDepartment: (user as any)?.department,
    getDepartmentFilter,
    canManageItem,
    canViewItem,
    filterByDepartment,
    isFiltered: !isAdmin && !isPlacementOfficer, // Whether filtering is active
  };
}
