import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  const role = useMemo(() => user?.role ?? null, [user?.role]);

  useEffect(() => {
    if (loading) return;

    // If not authenticated, redirect to auth
    if (!isAuthenticated || !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!user.role) {
      navigate('/role-selection', { replace: true });
      return;
    }
  }, [loading, isAuthenticated, user, navigate]);

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

  if (role === 'student') return <StudentDashboard />;
  if (role === 'faculty' || role === 'college_admin' || role === 'admin' || role === 'moderator') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}

export default Dashboard;
