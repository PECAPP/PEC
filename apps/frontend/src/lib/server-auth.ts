import { cookies } from 'next/headers';
import { getRolePermissions, UserRole } from '@/features/auth/lib/rolePermissions';
import { resolveInternalApiBaseUrl } from './internal-api-url';

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    // Try both prefixed (prod) and unprefixed (dev) cookie names
    const accessToken = 
      cookieStore.get('__Host-access_token')?.value || 
      cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    // Attempt to fetch full profile and permissions using the access token
    const apiBaseUrl = resolveInternalApiBaseUrl();
    const profileRes = await fetch(`${apiBaseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store', // Always fresh for SSR auth
    });

    if (!profileRes.ok) {
      return null;
    }

    const payload = await profileRes.json();

    const permsRes = await fetch(`${apiBaseUrl}/auth/me/permissions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    const permsData = permsRes.ok ? await permsRes.json() : { permissions: [] };
    const caslPermissions = permsData.permissions || [];

    const role = payload.role;

    const userId = payload.id || payload.uid || payload.sub;
    const fullName = payload.fullName || payload.name || 'User';
    const roles = Array.isArray(payload.roles) ? payload.roles : role ? [role] : [];

    const user = {
      id: userId,
      uid: userId,
      email: payload.email,
      fullName,
      name: payload.name || fullName,
      role,
      roles,
      organizationId: payload.organizationId || undefined,
      department: payload.department || undefined,
      enrollmentNumber: payload.enrollmentNumber || undefined,
      semester: typeof payload.semester === 'number' ? payload.semester : undefined,
      permissions: getRolePermissions((role as UserRole) || 'student'),
      caslPermissions, // Pass the raw array down, client will build the Ability
      avatar: payload.avatar || null,
      verified: payload.verified || false,
      profileComplete: payload.profileComplete || false,
    };

    return user;
  } catch (error) {
    console.error('Core SSR session error:', error);
    return null;
  }
}
