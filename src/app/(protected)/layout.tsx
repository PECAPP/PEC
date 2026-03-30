'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import FloatingAIChat from '@/components/chat/FloatingAIChat';

// Use a separate component to isolate the timing effect 
// It logs transition times automatically in dev mode.
function RouteTimingHelper() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Performance observer to catch the first paint after navigation
    const start = performance.now();
    let mounted = true;

    requestAnimationFrame(() => {
      // Wait for next frame to ensure React has rendered
      setTimeout(() => {
        if (!mounted) return;
        const end = performance.now();
        console.log(`[RouteTiming] ${pathname} rendered in ${Math.round(end - start)}ms`);
      }, 0);
    });

    return () => { mounted = false; };
  }, [pathname]);

  return null;
}

const Sidebar = dynamic(
  () => import('@/components/layout/Sidebar').then((mod) => mod.Sidebar),
  {
    ssr: false,
    loading: () => null,
  },
);

const Header = dynamic(
  () => import('@/components/layout/Header').then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => null,
  },
);

/* FloatingAIChat removed as part of decommissioning */

const BottomNav = dynamic(
  () => import('@/components/layout/BottomNav').then((mod) => mod.BottomNav),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Initialize from localStorage, default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>(() => {
    if (typeof window === 'undefined') return 'comfortable';
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
      if (pathname !== '/auth') {
        router.replace('/auth');
      }
      return;
    }

    if (!user.role) {
      if (pathname !== '/role-selection') {
        router.replace('/role-selection');
      }
      return;
    }

    if (!user.profileComplete) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
        role={effectiveRole as any}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Header 
        user={user} 
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
          isMobile && 'pb-16'
        )}
      >
        <div className="mesh-content-overlay" aria-hidden="true" />
        <div className="p-4 md:p-5 lg:p-6 ui-section-gap relative z-10">
          {process.env.NODE_ENV === 'development' && <RouteTimingHelper />}
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
      <FloatingAIChat />
    </div>
  );
}
