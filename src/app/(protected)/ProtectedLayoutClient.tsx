'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import FloatingAIChat from '@/components/chat/FloatingAIChat';

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
  user: any;
}

export function ProtectedLayoutClient({ children, user }: ProtectedLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>('comfortable');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen relative isolate overflow-x-hidden">
      <div className="mesh-gradient-bg">
        <div className="mesh-gradient-item mesh-1" />
        <div className="mesh-gradient-item mesh-2" />
        <div className="mesh-gradient-item mesh-3" />
      </div>

      <Sidebar
        role={user.role}
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
          'protected-shell pt-16 min-h-screen transition-all duration-150 relative overflow-hidden',
          isMobile ? 'pl-0' : (sidebarCollapsed ? 'pl-16' : 'pl-64'),
          isMobile && 'pb-16'
        )}
      >
        <div className="mesh-content-overlay" aria-hidden="true" />
        <div className="p-4 md:p-5 lg:p-6 ui-section-gap relative z-10">
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
      <FloatingAIChat />
    </div>
  );
}
