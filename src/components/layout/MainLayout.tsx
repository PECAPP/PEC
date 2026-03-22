import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import FloatingAIChat from '../FloatingAIChat';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserRole } from '@/types';



export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Initialize from localStorage, default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>(() => {
    const saved = localStorage.getItem('uiDensityMode');
    return saved === 'compact' ? 'compact' : 'comfortable';
  });

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
    localStorage.setItem('uiDensityMode', densityMode);
    document.documentElement.setAttribute('data-density', densityMode);
  }, [densityMode]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
      }
      return;
    }

    if (!user.role) {
      if (location.pathname !== '/role-selection') {
        navigate('/role-selection', { replace: true });
      }
      return;
    }

    if (!user.profileComplete) {
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate, location.pathname]);

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

  const effectiveRole = user.role;

  return (
    <div className="min-h-screen relative isolate overflow-x-hidden">
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
        densityMode={densityMode}
        onDensityModeChange={setDensityMode}
      />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-150 relative overflow-hidden',
          isMobile ? 'pl-0' : (sidebarCollapsed ? 'pl-16' : 'pl-64'),
          isMobile && user.role === 'student' && 'pb-16'
        )}
      >
        <div className="mesh-content-overlay" aria-hidden="true" />
        <div className={cn(location.pathname.endsWith("/chat") ? "p-0" : "p-4 md:p-5 lg:p-6 ui-section-gap", "relative z-10")}>
          <Outlet />
          {!location.pathname.endsWith("/chat") && <FloatingAIChat />}
        </div>
      </main>
      {isMobile && user.role === 'student' && <BottomNav />}
    </div>
  );
}
