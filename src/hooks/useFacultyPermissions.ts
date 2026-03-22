import { useEffect, useState } from 'react';
import { getFacultyPermissions, type FacultyPermissions } from '@/lib/accessControl';

interface UseFacultyPermissionsProps {
  facultyId: string | null;
  resourceType: 'course' | 'assignment' | 'attendance' | 'material' | 'grade' | 'exam';
  resourceData?: any;
}
 /** Hook to get faculty permissions for a resource
export function useFacultyPermissions({
  facultyId,
  resourceType,
  resourceData
}: UseFacultyPermissionsProps) {
  const [permissions, setPermissions] = useState<FacultyPermissions>({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      if (!facultyId) {
        setLoading(false);
        return;
      }

      try {
        const perms = await getFacultyPermissions(facultyId, resourceType, resourceData);
        setPermissions(perms);
      } catch (error) {
        console.error('Error loading faculty permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [facultyId, resourceType, resourceData?.id, resourceData?.courseId]);

  return { permissions, loading };
}
