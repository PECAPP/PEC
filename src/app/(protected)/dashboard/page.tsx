'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const dashboardLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const createRoleDashboard = (role: string) => {
  if (role === 'student') {
    return dynamic(
      () => import('./dashboards/StudentDashboard').then((mod) => mod.StudentDashboard),
      { ssr: false, loading: dashboardLoader }
    );
  }

  if (role === 'faculty') {
    return dynamic(
      () => import('./dashboards/FacultyDashboard').then((mod) => mod.FacultyDashboard),
      { ssr: false, loading: dashboardLoader }
    );
  }

  return dynamic(
    () => import('./dashboards/AdminDashboard').then((mod) => mod.AdminDashboard),
    { ssr: false, loading: dashboardLoader }
  );
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const role = useMemo(() => user?.role ?? null, [user?.role]);
  const resolvedRole = role ?? 'student';
  const ResolvedDashboard = useMemo(() => createRoleDashboard(resolvedRole), [resolvedRole]);

  useEffect(() => {
    if (loading) return;

    // If not authenticated, redirect to auth
    if (!isAuthenticated || !user) {
      router.replace('/auth');
      return;
    }

    if (!user.role) {
      router.replace('/role-selection');
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return <ResolvedDashboard />;
}
