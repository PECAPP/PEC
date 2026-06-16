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
import { buildAbilityFor } from '@/lib/casl-ability';

interface RoleGuardProps {
  roles?: string[];
  permission?: { action: string; subject: string };
  children: React.ReactNode;
  redirectTo?: string;
}

export async function RoleGuard({
  roles,
  permission,
  children,
  redirectTo = '/dashboard',
}: RoleGuardProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  let allowed = false;

  if (permission) {
    const ability = buildAbilityFor(session.caslPermissions, session.role);
    allowed = ability.can(permission.action, permission.subject as any);
  } else if (roles) {
    const userRole = session.role ?? '';
    allowed = roles.includes(userRole);
  } else {
    allowed = true;
  }

  if (!allowed) {
    redirect(redirectTo as any);
  }

  return <>{children}</>;
}
