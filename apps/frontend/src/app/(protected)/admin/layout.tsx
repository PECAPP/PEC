/**
 * Admin layout — wraps all /admin/* routes.
 * Only college_admin users are allowed; everyone else is redirected to /dashboard.
 */
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['college_admin']}>
      {children}
    </RoleGuard>
  );
}
