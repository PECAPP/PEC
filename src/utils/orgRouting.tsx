import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

/** Hook to get current user's organization slug. */
export function useOrgSlug() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  return orgSlug || null;
}

/** Redirects organization-scoped users onto `/:orgSlug/...` routes. */
export function OrgRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user } = usePermissions();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user) return;

      try {
        const profileRes = await api.get('/auth/profile');
        const payload = profileRes.data;
        const userData =
          payload && typeof payload === 'object' && 'success' in payload && 'data' in payload
            ? payload.data
            : payload;

        if (!userData) return;

        if (!orgSlug) {
          const resolvedSlug =
            userData.organizationSlug || userData.orgSlug || userData.organization?.slug;

          if (resolvedSlug) {
            const currentPath = window.location.pathname;
            navigate(`/${resolvedSlug}${currentPath}`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      }
    };

    void checkAndRedirect();
  }, [navigate, orgSlug, user]);

  return <>{children}</>;
}
