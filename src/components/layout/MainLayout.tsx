import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/types';
import FloatingAIChat from '../FloatingAIChat';
import { BottomNav } from './BottomNav';



export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Initialize from localStorage, default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate('/auth', { replace: true });
    }
    
    if (!loading && user && !user.role) {
      navigate('/role-selection', { replace: true });
    }
    
    if (!loading && user && !user.profileComplete) {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine effective role for sidebar display
  // If super admin is viewing a specific organization, show college_admin sidebar
  const effectiveRole = (user.role === 'super_admin' && orgSlug) ? 'college_admin' : user.role;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Atmosphere Mesh Gradient */}
      <div className="mesh-gradient-bg">
        <div className="mesh-gradient-item mesh-1" />
        <div className="mesh-gradient-item mesh-2" />
        <div className="mesh-gradient-item mesh-3" />
      </div>

      <Sidebar
        role={effectiveRole}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Header 
        user={{
          id: user.uid,
          name: user.fullName || 'User',
          email: user.email || '',
          role: user.role,
          avatar: user.avatar || undefined,
          profileComplete: user.profileComplete
        }} 
        sidebarCollapsed={sidebarCollapsed} 
        isMobile={isMobile}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isMobile ? 'pl-0' : (sidebarCollapsed ? 'pl-16' : 'pl-64'),
          isMobile && user.role === 'student' && 'pb-16'
        )}
      >
        <div className={location.pathname.endsWith("/chat") ? "p-0" : "p-4 lg:p-6"}>
          <Outlet />
          {!location.pathname.endsWith("/chat") && <FloatingAIChat />}
        </div>
      </main>
      {isMobile && user.role === 'student' && <BottomNav />}
    </div>
  );
}
