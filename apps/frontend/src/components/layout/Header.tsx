import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, formatDate } from "@pec/ui";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from "@pec/api";
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
} from 'lucide-react';

// import { auth } from '@/config/storage';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import {  authClient  } from "@pec/api";
import type { User as UserType } from '@pec/shared';
import { useAuth } from '@/features/auth/hooks/useAuth';

const CommandMenu = dynamic(() => import('@/components/layout/CommandMenu'), {
  ssr: false,
  loading: () => (
    <div className="relative group cursor-pointer">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      <Input
        placeholder="Search..."
        className="pl-10 pr-20 bg-white/5 backdrop-blur-md border border-white/10 shadow-sm hover:bg-white/10 transition-colors focus-visible:ring-1 focus-visible:ring-primary cursor-pointer text-foreground placeholder:text-muted-foreground/60 h-10 rounded-lg"
        readOnly
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <kbd className="inline-flex h-5 items-center justify-center rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">Ctrl</kbd>
        <span className="text-[10px] text-muted-foreground">+</span>
        <kbd className="inline-flex h-5 items-center justify-center rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">K</kbd>
      </div>
    </div>
  ),
});

const ThemeToggler = dynamic(() => import('../../components/ThemeToggler'), {
  ssr: false,
  loading: () => null,
});

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
  densityMode?: 'comfortable' | 'compact';
  onDensityModeChange?: (mode: 'comfortable' | 'compact') => void;
  sidebarWidth: number;
}

export function Header({ user, sidebarCollapsed, isMobile, onMenuClick, sidebarWidth }: HeaderProps) {
  const router = useRouter();

  const appLogoSrc = '/logo.png';
  const showNavbarLogo = Boolean(isMobile) || sidebarCollapsed;

  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const roleLabels: Record<string, string> = {
    faculty: 'Faculty',
    student: 'Student',
    admin: 'Admin',
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-16 header-accent transition-all duration-150 shadow-sm",
        isMobile && "left-0"
      )}
      style={{
        left: isMobile ? 0 : (sidebarCollapsed ? '4rem' : `${sidebarWidth}px`)
      }}
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
          <div className="hidden md:block">
            <ThemeToggler />
          </div>
          <div className="hidden lg:block scale-90 sm:scale-100">
             <GoogleTranslate containerId="google_translate_header" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border border-background animate-pulse" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col border-l border-border bg-background/95 backdrop-blur-xl">
              <SheetHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between space-y-0">
                <SheetTitle className="text-sm font-bold tracking-tight">Notification Center</SheetTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-sm font-medium  text-primary hover:text-primary hover:bg-primary/5 m-0"
                  onClick={() => router.push('/noticeboard')}
                >
                  View All
                </Button>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-2">
                <NoticePreviewList router={router} />
              </div>
            </SheetContent>
          </Sheet>

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
    <div className="py-8 text-center text-[10px] uppercase font-bold  text-muted-foreground/30 animate-pulse">
      Securing Updates...
    </div>
  );

  if (notices.length === 0) return (
    <div className="py-12 text-center">
      <Bell className="w-8 h-8 mx-auto mb-2 opacity-10" />
      <p className="text-sm font-medium  text-muted-foreground opacity-40">System Clear</p>
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
              <span className="text-xs font-medium uppercase text-muted-foreground/50 ">
                {formatDate(n.publishedAt || n.createdAt)}
              </span>
              {n.category && (
                <span className="text-[8px] font-bold uppercase py-0.5 px-1.5 bg-muted/40 border border-border/40 text-muted-foreground/80  rounded-sm">
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
