import { cookies } from 'next/headers';
import { getSessionFromToken } from './session';
import { buildApiUrl } from '@pec/api';
import { getRolePermissions, UserRole } from '@/features/auth/lib/rolePermissions';

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
    const internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:4000';
    const profileRes = await fetch(`${internalApiUrl}/v1/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store', // Always fresh for SSR auth
    });

    if (!profileRes.ok) {
      return null;
    }

    const payload = await profileRes.json();

    const permsRes = await fetch(`${internalApiUrl}/v1/auth/me/permissions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    const permsData = permsRes.ok ? await permsRes.json() : { permissions: [] };
    let caslPermissions = permsData.permissions || [];

    const role = payload.role;
    const isAdmin = role === 'admin';

    // DB Fallback if DB is completely empty of permissions
    if (caslPermissions.length === 0) {
      caslPermissions = isAdmin
        ? [{ action: 'manage', subject: 'all' }]
        : [
            { action: 'read', subject: 'Attendance' },
            { action: 'read', subject: 'AttendanceSession' },
            { action: 'read', subject: 'Timetable' },
            { action: 'read', subject: 'Course' },
            { action: 'read', subject: 'Notice' },
            { action: 'read', subject: 'FeeRecord' },
            { action: 'read', subject: 'MarketplaceListing' },
            { action: 'read', subject: 'HostelIssue' },
            { action: 'read', subject: 'CanteenItem' },
            { action: 'read', subject: 'Room' },
            { action: 'read', subject: 'FeatureFlag' },
            { action: 'read', subject: 'Examination' },
            { action: 'read', subject: 'Enrollment' },
            { action: 'read', subject: 'Department' },
            { action: 'read', subject: 'CgpaEntry' },
            { action: 'read', subject: 'CampusMap' },
            { action: 'read', subject: 'CourseMaterial' },
          ];
    }

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
