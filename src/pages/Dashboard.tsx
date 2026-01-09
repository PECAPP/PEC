import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { SuperAdminDashboard } from './dashboards/SuperAdminDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { PlacementOfficerDashboard } from './dashboards/PlacementOfficerDashboard';
import { FacultyDashboard } from './dashboards/FacultyDashboard';
import { RecruiterDashboard } from './dashboards/RecruiterDashboard';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not authenticated, redirect to auth
        navigate('/auth');
        return;
      }

      try {
        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (!userData) {
          // User document doesn't exist, something went wrong
          navigate('/auth');
          return;
        }

        // Check if role is null
        if (!userData.role || userData.role === null) {
          // No role selected, redirect to role selection
          navigate('/role-selection');
          return;
        }

        // Check if profile is incomplete
        if (!userData.profileComplete) {
          // Profile not complete, redirect to onboarding
          navigate('/onboarding');
          return;
        }

        // Everything is good, set the role and show dashboard
        setUserRole(userData.role);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // On error, redirect to auth
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-based dashboard
  switch (userRole) {
    case 'super_admin':
    case 'college_admin':
      return <AdminDashboard />;
    case 'placement_officer':
      return <PlacementOfficerDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
}

export default Dashboard;
