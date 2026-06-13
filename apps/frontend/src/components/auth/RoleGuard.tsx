/**
 * RoleGuard — Server Component
 *
 * Usage:
 *   <RoleGuard roles={['college_admin']}>
 *     <AdminPage />
 *   </RoleGuard>
 *
 * If the user's role is not in the whitelist they are redirected to /dashboard.
 */
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-auth';

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export async function RoleGuard({
  roles,
  children,
  redirectTo = '/dashboard',
}: RoleGuardProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  const userRole = session.role ?? '';
  const allowed = roles.includes(userRole);

  if (!allowed) {
    redirect(redirectTo as any);
  }

  return <>{children}</>;
}
