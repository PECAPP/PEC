import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/types';
import FloatingAIChat from '../FloatingAIChat';

// Mock user for demo - in real app, this would come from auth context
const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  role: 'student',
};

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={user?.role || mockUser.role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Header 
        user={user ? {
          id: user.uid,
          name: user.fullName || 'User',
          email: user.email || '',
          role: user.role,
          avatar: user.avatar || undefined,
          profileComplete: user.profileComplete
        } : mockUser} 
        sidebarCollapsed={sidebarCollapsed} 
        isMobile={isMobile}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isMobile ? 'pl-0' : (sidebarCollapsed ? 'pl-16' : 'pl-64')
        )}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
          {location.pathname!=="/chat" && <FloatingAIChat />}
        </div>
      </main>
    </div>
  );
}
