import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  Palette,
  Building2,
} from 'lucide-react';


// import { auth } from '@/config/storage';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import type { User as UserType } from '@/types';

const CommandMenu = dynamic(() => import('@/components/layout/CommandMenu'), {
  ssr: false,
  loading: () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search... (Ctrl+K)"
        className="pl-10 bg-background border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
        readOnly
      />
    </div>
  ),
});

const ThemeToggler = dynamic(() => import('../../components/ThemeToggler'), {
  ssr: false,
  loading: () => null,
});

const LandingColorTheme = dynamic(
  () => import('@/components/LandingColorTheme').then((mod) => mod.LandingColorTheme),
  {
    ssr: false,
    loading: () => null,
  },
);

const GoogleTranslate = dynamic(
  () => import('@/components/GoogleTranslate').then((mod) => mod.GoogleTranslate),
  {
    ssr: false,
    loading: () => null,
  },
);

interface HeaderProps {
  user: UserType;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
  densityMode: 'comfortable' | 'compact';
  onDensityModeChange: (mode: 'comfortable' | 'compact') => void;
}

export function Header({ user, sidebarCollapsed, isMobile, onMenuClick, densityMode, onDensityModeChange }: HeaderProps) {
  const router = useRouter();

  const appLogoSrc = '/logo.png';
  const showNavbarLogo = Boolean(isMobile) || sidebarCollapsed;

  const handleSignOut = async () => {
    try {
      await authClient.logout();
      window.dispatchEvent(new Event('auth-failed'));
      toast.success('Signed out successfully');
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const roleLabels: Record<string, string> = {
    college_admin: 'College Admin',
    faculty: 'Faculty',
    student: 'Student',
    admin: 'System Admin',
    moderator: 'Moderator',
    user: 'Regular User',
    placement_officer: 'Placement Officer',
    recruiter: 'Recruiter',
    super_admin: 'Super Admin',
  };

  const showNoticeboardButton = user.role === 'college_admin' || user.role === 'admin' || user.role === 'super_admin';

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-16 border-b border-sidebar-border bg-background transition-all duration-150 shadow-sm",
        isMobile ? "left-0" : (sidebarCollapsed ? "left-16" : "left-64")
      )}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {showNavbarLogo && (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mr-2 h-10 w-10 md:h-11 md:w-11 shrink-0 overflow-hidden bg-background/60 hover:bg-secondary transition-colors"
            aria-label="Go to dashboard"
          >
            <div className="relative h-full w-full p-1">
              <Image 
                src={appLogoSrc} 
                alt="App logo" 
                fill 
                sizes="44px"
                className="object-contain" 
                priority 
              />
            </div>
          </button>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-2 md:w-80 md:flex-none group z-50">
           <CommandMenu />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center border border-border">
            <button
              type="button"
              onClick={() => onDensityModeChange('comfortable')}
              className={cn(
                "px-2.5 h-8 text-[11px] font-medium transition-colors",
                densityMode === 'comfortable'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              Comfort
            </button>
            <button
              type="button"
              onClick={() => onDensityModeChange('compact')}
              className={cn(
                "px-2.5 h-8 text-[11px] font-medium transition-colors border-l border-border",
                densityMode === 'compact'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              Compact
            </button>
          </div>
          <div className="scale-90 sm:scale-100"><GoogleTranslate containerId="google_translate_header" /></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="text-sm font-bold tracking-tight">Recent Notices</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => router.push('/noticeboard')}
                >
                  View All
                </Button>
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1 px-1">
                <NoticePreviewList router={router} />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:block"><LandingColorTheme /></div>
          <div className="hidden md:block"><ThemeToggler/></div>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1.5 border border-transparent hover:border-border hover:bg-secondary transition-colors">
                <div className="relative w-8 h-8 border border-border bg-primary flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      fill 
                      sizes="32px"
                      className="object-cover" 
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="swiss-meta-label">{roleLabels[user.role]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="swiss-meta-label normal-case tracking-normal">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  void handleSignOut();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NoticePreviewList({ router }: { router: any }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get('/noticeboard', { params: { limit: 4, offset: 0 } });
        setNotices(res?.data?.data || []);
      } catch {
        // Silently skip
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="py-8 text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/30 animate-pulse">
      Securing Updates...
    </div>
  );

  if (notices.length === 0) return (
    <div className="py-12 text-center">
      <Bell className="w-8 h-8 mx-auto mb-2 opacity-10" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">System Clear</p>
    </div>
  );

  return (
    <div className="space-y-1">
      {notices.map((n, i) => (
        <button
          key={n.id || i}
          className="w-full text-left p-3 hover:bg-secondary transition-colors group flex items-start gap-3 rounded-sm"
          onClick={() => router.push(`/noticeboard#${n.id}`)}
        >
          <div className={cn(
            "mt-1 w-2 h-2 rounded-full flex-shrink-0",
            n.important ? "bg-destructive animate-pulse" : (n.pinned ? "bg-primary" : "bg-muted-foreground/30")
          )} />
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">
              {n.title}
            </h4>
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-[1.3] font-medium opacity-80">
              {n.content}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[9px] font-bold uppercase text-muted-foreground/50 tracking-widest">
                {new Date(n.publishedAt || n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              {n.category && (
                <span className="text-[8px] font-bold uppercase py-0.5 px-1.5 bg-muted/40 border border-border/40 text-muted-foreground/80 tracking-widest rounded-sm">
                  {n.category}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
